import { ApiClient, EventBase } from "../api";
import { Subscriptions } from "./subscriptions";

export class EventBus {
  private readonly subscribers = new Subscriptions<EventBase>();
  private polling?: Promise<void>;
  private pushWait?: CancellableTimer;
  private isStopped = false;

  constructor(
    private readonly client: ApiClient
  ) {
    this.pushEvents();
  }

  subscribe(action: (event: EventBase) => void) {
    // Initialize polling after there is at least one subscriber.
    this.polling ??= this.pollEvents();
    
    return this.subscribers.subscribe(action);
  }

  publish(event: EventBase) {
    const events = this.loadEvents();
    
    events.push(event);
    
    this.storeEvents(events);

    // Cancel the wait for new events to push the current action immediately.
    this.pushWait?.cancel();
  }

  private async pushEvents() {
    while (!this.isStopped) {
      this.pushWait = delay(5000);
      await this.pushWait.promise;

      try {

        const source = this.loadEvents();

        if (source.length === 0) {
          continue;
        }
        
        const events = source.map(source => {
          const { $type, ...other } = source;

          return { $type, ...other };
        });
  
        await this.client.events.postEvents({ events: events });

        // There could be new events after the current events have been pushed, therefore we have to retrieve them again.
        const afterUpdate = this.loadEvents();

        for (const event of source) {
          afterUpdate.splice(afterUpdate.indexOf(event), 1);
        }

        this.storeEvents(afterUpdate);
      } catch (ex) {
        console.log(`Failed to push events: ${ex}. Retry in 5 seconds.`)
      }
    }
  }

  private async pollEvents() {
    let position = this.loadPosition();
  
    while (!this.isStopped) {
      await new Promise<void>((resolve, reject) => {
        this.client.events.streamEvents(position)
          .subscribe({
            next: event => {
              this.subscribers.publish(event);

              position = event.metadata.ts;
              this.storePosition(position);
            },
            complete: () => {
              resolve();
            },
            error: ex => {
              console.log(`Failed to poll events: ${ex}. Retry in 5 seconds.`)
              reject()
            },
          })
      });

      await delay(5000).promise;
    }
  }

  private storeEvents(events: EventBase[]) {
    const serialized = JSON.stringify(events, undefined, 2);

    localStorage.setItem('events', serialized);
  }

  private storePosition(position: number) {
    const serialized = position.toString();

    localStorage.setItem('position', serialized);
  }

  private loadPosition() {
    const stored = localStorage.getItem('position');

    if (!stored) {
      return 0;
    }

    return +stored;
  }

  private loadEvents() {
    const stored = localStorage.getItem('events');

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as EventBase[];
  }
}

type CancellableTimer = {
  promise: Promise<void>;

  cancel: () => void;
}

function delay(ms: number): CancellableTimer {
  let currentResolve: (() => void) | null = null;

  return {
    promise: new Promise(resolve => {
      currentResolve = resolve;

      setTimeout(() => {
        currentResolve?.();
      }, ms);
    }),
    cancel: () => {
      currentResolve?.();
      currentResolve = null;
    },
  }
}
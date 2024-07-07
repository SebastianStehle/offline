/* eslint-disable @typescript-eslint/no-explicit-any */
import { Observable } from "rxjs";
import { EventBase, EventsClient, TodoCompleted, TodoCreated, TodoDeleted, TodoUpdated, TodosClient } from "./generated";
export * from './generated';

const CONFIGURATION = {
  basePath: 'http://localhost:5005'
};

export function isTodoCreated(source: EventBase): source is TodoCreated {
  return source.$type === 'TodoCreated';
}

export function isTodoCompleted(source: EventBase): source is TodoCompleted {
  return source.$type === 'TodoCompleted';
}

export function isTodoUpdated(source: EventBase): source is TodoUpdated {
  return source.$type === 'TodoUpdated';
}

export function isTodoDeleted(source: EventBase): source is TodoDeleted {
  return source.$type === 'TodoDeleted';
}

class CustomEvents extends EventsClient {
  streamEvents(afterTimestamp = 0) {
    return new Observable<EventBase>((subscriber) => {
      const source = new EventSource(
        `${CONFIGURATION.basePath}/api/events?afterTimestamp=${afterTimestamp}`,
        {
          withCredentials: true,
        },
      );

      source.addEventListener('message', (event) => {
        if (!event) {
          source.close();

          subscriber.complete();
        } else {
          subscriber.next(JSON.parse(event.data));
        }
      });

      source.addEventListener('error', (event) => {
        const data = (event as any)['data'];

        try {
          if (data) {
            try {
              subscriber.error(JSON.parse(data).message);
            } finally {
              subscriber.error(data);
            }
          }
        } finally {
          subscriber.complete();
          source.close();
        }
      });

      return () => {
        source.close();
      };
    });
  }
}

export class ApiClient {
  public readonly events = new CustomEvents(CONFIGURATION.basePath);

  public readonly todos = new TodosClient(CONFIGURATION.basePath);
}

export const API_CLIENT = new ApiClient();

export function useApi() {
  return API_CLIENT;
}
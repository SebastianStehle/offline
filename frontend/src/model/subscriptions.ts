type Action<T> = (payload: T) => void;

export class Subscriptions<T> {
  private readonly subscribers: Action<T>[] = [];
  
  subscribe(action: Action<T>) {
    this.subscribers.push(action);
    
    return () => {
      this.subscribers.splice(this.subscribers.indexOf(action, 1));
    }
  }

  publish(value: T) {
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }
}
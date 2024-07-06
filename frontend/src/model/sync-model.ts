/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventBase } from "../api";
import { guid } from "./utils";

export interface ModelField {
  value: any;

  ts: number;
}

export type ModelValues<T> = Record<keyof T, ModelField>;

export type Update<T> = { newValue: T, isConflict: boolean, event: EventBase };

export abstract class SyncModel<T extends object> {
  public readonly values: ModelValues<T>;

  constructor(
    public readonly id: string,
    values: ModelValues<T> = {} as unknown as any,
  ) {
    this.values = values;
  }

  abstract apply(event: EventBase): Update<this>;

  update(updates: Partial<T>, event: EventBase): Update<this> {
    const ts = event.metadata.ts;

    let canUpdate = true;
    for (const key of Object.keys(updates)) {
      const existing = this.values[key as unknown as keyof T];

      if (existing && existing.ts > ts) {
        canUpdate = false;
        true;
      }
    }

    if (!canUpdate) {
      return { newValue: this, isConflict: true, event };
    }
    
    const clone = { ...this.values };
    for (const [key, value] of Object.entries(updates)) {
      clone[key as unknown as keyof T] = { value, ts };
    }

    const result = Object.create(Object.getPrototypeOf(this));

    result.id = this.id;
    result.values = clone;

    return { newValue: result, isConflict: false, event };
  }

  metadata(user: string): EventBase['metadata'] {
    const ts = new Date().getTime();

    return { objectId: this.id, ts, user, eventId: guid() };
  }
}

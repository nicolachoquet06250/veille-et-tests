import {Signal} from "./Signal.ts";
import {Computed} from "./Computed.ts";
import {Effect} from "./Effect.ts";

export * from './Signal.ts';
export * from './Computed.ts';
export * from './Effect.ts';

export const signal = <T>(defaultValue: T) => new Signal<T>(defaultValue);
export const computed = <T>(computeFn: () => T) => new Computed<T>(computeFn);
export const effect = (effectFn: () => void) => new Effect(effectFn);
import {setCurrentAccessed} from "./Signal.ts";

export const effectQueue: Effect[] = [];

export class Effect {
    readonly #effectFn: () => void;
    #isStale: boolean;

    constructor(effectFn: () => void) {
        this.#effectFn = effectFn;
        this.#isStale = true;
        this._execute();
    }

    _execute() {
        if (this.#isStale) {
            setCurrentAccessed(this);
            this.#effectFn();
            setCurrentAccessed(null);
        }
        this.#isStale = false;
    }

    _update() {
        if (!this.#isStale) {
            this.#isStale = true;
            effectQueue.push(this);
        }
    }
}

export function executeEffects() {
    while (effectQueue.length > 0) {
        const effect = effectQueue.shift();
        effect?._execute();
    }
}
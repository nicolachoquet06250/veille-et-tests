import {Computed} from "./Computed.ts";
import {executeEffects} from "./Effect.ts";

// Global variable to keep track of the currently accessed computed or effect
export let currentAccessed: any|null = null;

export const setCurrentAccessed = (v: any|null) => {
    currentAccessed = v;
};

export class Signal<T> {

    #value: T;
    readonly #dependents: Computed<T>[];

    constructor(initialValue: T) {
        this.#value = initialValue;
        this.#dependents = [];
    }

    get value() {
        if (currentAccessed) {
            this._addDependent(currentAccessed);
        }
        return this.#value;
    }

    set value(newValue) {
        if (this.#value !== newValue) {
            this.#value = newValue;
            this._notifyDependents();
            executeEffects();
        }
    }

    _addDependent(computed: Computed<T>) {
        if (!this.#dependents.includes(computed)) {
            this.#dependents.push(computed);
        }
    }

    private _notifyDependents() {
        for (const dependent of this.#dependents) {
            dependent._update();
        }
    }
}
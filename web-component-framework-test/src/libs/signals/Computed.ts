import {currentAccessed, setCurrentAccessed} from "./Signal.ts";
import {Effect} from "./Effect.ts";

export class Computed<T> {
    #computeFn: () => T;
    #isStale;
    #value: T|undefined;
    #dependents: (Effect|Computed<T>)[];

    constructor(computeFn: () => T) {
        this.#computeFn = computeFn;
        this.#value = undefined;
        this.#isStale = true;
        this.#dependents = [];
    }

    get value() {
        if (this.#isStale) {
            const previousContext = currentAccessed;
            setCurrentAccessed(this);
            this.recomputeValue();
            setCurrentAccessed(previousContext);
        }

        if (currentAccessed) {
            this.addDependent(currentAccessed);
        }

        return this.#value;
    }

    recomputeValue() {
        this.#value = this.#computeFn();
        this.#isStale = false;
    }

    addDependent(dependent: Effect|Computed<T>) {
        if (!this.#dependents.includes(dependent)) {
            this.#dependents.push(dependent);
        }
    }

    _update() {
        if (!this.#isStale) {
            this.#isStale = true;
            for (const dependent of this.#dependents) {
                dependent._update();
            }
        }
    }
}

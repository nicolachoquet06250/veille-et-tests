import {Computed, effect, Signal} from "@/signals";
import {getFunctionName, getFunctionParameters, getParentFunctionName, toTagName} from "@/webcomponents/helpers";
import {hashCode} from '@/webcomponents/helpers/strings.ts';

type ComponentFn<
    Props extends Record<
        string,
        string | number | boolean | object | Signal<any> | Computed<any>
    >,
    Args = {
        -readonly [K in keyof Props]: Props[K]
    }
> = (args: Args) => void;

export const component = <
    Props extends Record<string, string | number | boolean | object | Signal<any> | Computed<any>>
>(fn: ComponentFn<Props>): any => {
    const tagName = toTagName(getFunctionName(fn));
    console.log(getFunctionName(fn), tagName, 'h' + hashCode(tagName));

    if (!window.componentParameters) {
        window.componentParameters = {};
    }
    if (!window.componentFunctionString) {
        window.componentFunctionString = {};
    }
    if (!window.componentId) {
        window.componentId = {};
    }

    window.componentParameters[tagName] = getFunctionParameters(fn);
    window.componentFunctionString[tagName] = fn.toString();
    window.componentId[tagName] = 'h' + hashCode(tagName);

    return (props: Props) => fn(props ?? {});
}

export const html = ({raw = []}: TemplateStringsArray, ...vars: any[]): void => {
    const tagName = toTagName(getParentFunctionName('html'));

    if (!customElements.get(toTagName(getParentFunctionName('html')))) {
        const componentParameters = [...window.componentParameters[tagName]];
        // const componentFunctionToString = window.componentFunctionString[tagName];
        const hash = window.componentId[tagName];

        // delete window.componentParameters[toTagName(getParentFunctionName('html'))];
        // delete window.componentFunctionString[toTagName(getParentFunctionName('html'))];
        // delete window.componentId[tagName];

        class Component extends HTMLElement {
            #events: Record<string, EventListenerOrEventListenerObject> = {};

            constructor() {
                super();

                this.setAttribute('data-webcomponent-hash', hash);

                for (const v of vars) {
                    if (typeof v === 'object') {
                        effect(() => {
                            this.#render();
                        })
                    }
                }
            }

            connectedCallback() {
                this.#render();
                console.log('je suis connecté');
            }

            disconnectedCallback() {
                this.#removeEventListeners();
                console.log('je suis déconnecté');
            }

            static get observedAttributes() {
                return [...componentParameters];
            }

            attributeChangedCallback<
                T extends string|number|boolean|object
            >(attr: string, oldVal: T, val: T) {
                console.log(attr, oldVal, val);
            }

            #render() {
                const str = raw.map((item, i) => {
                    if (typeof vars[i] === 'function') {
                        const event = item.replace('\\n', '').replace('=', '').trim();
                        if (event.startsWith('on:')) {
                            this.#events[event.replace('on:', '')] = vars[i];

                            return '';
                        }
                    }

                    if (typeof vars[i] === 'object') {
                        // console.log(componentParameters, i, this.getAttribute(componentParameters[i]));
                        return item + vars[i].value ?? this.getAttribute(componentParameters[i])
                    }

                    if (vars[i] === undefined || vars[i] === null) {
                        if (item.endsWith('=')) {
                            return item + '""';
                        }
                        return item;
                    }

                    return item + vars[i];
                });

                this.#removeEventListeners();
                this.innerHTML = str.join('');
                this.#addEventListeners();
                // console.log('render', str);
            }

            #addEventListeners() {
                for (const event of Object.keys(this.#events)) {
                    this.addEventListener(event, this.#events[event]);
                }
            }

            #removeEventListeners() {
                for (const event of Object.keys(this.#events)) {
                    this.removeEventListener(event, this.#events[event]);
                }
            }
        }

        customElements.define(toTagName(getParentFunctionName('html')), Component);
    }
};

export const css = ({raw = []}: TemplateStringsArray, ...vars: any[]) => {
    const tagName = toTagName(getParentFunctionName('css'));

    const hash = window.componentId[tagName];

    const render = <T>(_?: T|undefined) => {
        document.head.insertAdjacentHTML('beforeend', `
            <style type="text/css" id="${tagName}">
                [data-webcomponent-hash="${hash}"] ${raw.join('').split('\n').map(e => e.trim()).join('')}
            </style>
        `);
    };

    for (const v of vars) {
        if (typeof v === 'object') {
            effect(() => {
                render(v.value);
            })
        }
    }

    if (!customElements.get(toTagName(getParentFunctionName('css')))) {
        render();
    }

    console.log('css', raw, vars, toTagName(getParentFunctionName('css')));
}
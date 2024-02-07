import {signal} from "@/signals";
import {component, css, html} from "@/webcomponents";

export function setupCounter(element: HTMLButtonElement) {
  let counter = 0;
  const setCounter = (count: number) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener('click', () => setCounter(counter + 1));
  setCounter(0);

  cCounter();
  cCounter({ start: 12 });
}

type CounterProps = {
  start?: number;
  toto: string;
  tata: string;
};

const cCounter = component<CounterProps>(function mCounter({
  start = 0,
  toto, tata
}) {
  const count = signal(start);
  const increment = () => count.value++;

  css`
    button {
      background-color: red;
    }
  `;

  return html`
    <button 
        id="counter" 
        type="button"
        toto=${toto}
        tata=${tata}
        on:click=${increment} 
    >
      ${count}
    </button>
  `;
});
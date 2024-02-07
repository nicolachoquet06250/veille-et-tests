import './style.css';
import javascriptLogo from './javascript.svg';
import viteLogo from '/vite.svg';
import { setupCounter } from './counter';
import { generatePDF } from './export2pdf';
import { Wyziwyg } from './components/wyziwyg';

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="${viteLogo}" class="logo" alt="Vite logo" />
    </a>

    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>

    <h1 data-extract_color="black">Hello Vite!</h1>

    <div class="card">
      <button id="counter" type="button"></button>

      <button id="export-pdf" type="button" data-hide_in_export>Exporter en PDF</button>
    </div>

    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>

    <wyzi-wyg value="<h1>test</h1>" />
  </div>
`

setupCounter(document.querySelector('#counter'));

document.querySelector('#export-pdf')
    .addEventListener('click', generatePDF(document.querySelector('#app')));

customElements.define(Wyziwyg.tag, Wyziwyg);

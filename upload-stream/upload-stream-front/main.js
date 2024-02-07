import './style.css';
import { setupForm } from './form.js';
import { setupConnectivityAlert } from './connectivity-alert';

document.querySelector('#app').innerHTML = /*html*/`
  <div id="form-container">
    <form action="http://localhost:3001" method="post">
      <input type="file" />

      <button>
        Envoyer
      </button>

      <progress value="0" max="100" data-percent="0%"></progress>
    </form>

    <div></div>

    <iframe></iframe>
  </div>

  <div class="alerts"></div>
`;

setupConnectivityAlert();

setupForm(document.querySelector('#form-container'));

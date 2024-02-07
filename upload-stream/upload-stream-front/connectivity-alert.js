const alertTemplate = (message, bg = '') => /*html*/`<section class="alert ${bg}">
    ${message}
</section>`;

/**
 * createAlert`un petit message de test.${'une couleur'}`
 * 
 * @param {string} message Représente le message affiché dans l'alert
 * @param {string} color Représente la couleur de fond de l'alert. ( whiteSmoke par default )
 */
export const createAlert = ([message], color = '') => {
    const parent = document.querySelector('.alerts');
    
    const alert = document.createElement('template');
    alert.innerHTML = alertTemplate(message, color);

    const alertEl = parent.appendChild(alert.content.cloneNode(true).firstChild);

    setTimeout(() => {
        alertEl.classList.add('show');
    }, 5);

    setTimeout(() => {
        alertEl.classList.add('remove');
        const handleRemove = () => {
            alertEl.removeEventListener('transitionend', handleRemove);
            alertEl.remove();
        };

        alertEl.addEventListener('transitionend', handleRemove);
    }, 4000);
};

export const setupConnectivityAlert = () => {
    window.addEventListener('offline', () => {
        createAlert`Vous êtes actuellement hors ligne.${'red'}`;
    });
    
    window.addEventListener('online', () => {
        createAlert`Vous à nouveau en ligne.${'green'}`;
    });
};
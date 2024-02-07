import { createAlert } from "./connectivity-alert";

export const setupForm = (container) => {
    const slice_size = 1000 * 1024;
    let offline_cache = {};

    window.addEventListener('online', () => {
        if (Object.keys(offline_cache).length > 0) {
            const {form, f, reader, next, token} = offline_cache;
            upload(form, f, reader, next, token);
        }
    });

    const start_uplaod = e => {
        try {
            const input = container.querySelector('form > input');

            const f = input.files[0];

            const reader = new FileReader();

            if (!navigator.onLine) {
                offline_cache = {form, f, reader, next: 0, token: ''};
                createAlert`L'upload reprendra lorse que vous serez reconnecté.`;
                return;
            }
            upload(e.target, f, reader);
        } catch (err) {
            container.querySelector('form ~ div').innerHTML = err.message;
        }
    };

    /**
     * @param {HTMLFormElement} form 
     * @param {File} f 
     * @param {FileReader} reader 
     * @param {number} start 
     * @param {string} token 
     */
    const upload = (form, f, reader, start = 0, token = '') => {
        const next = start + slice_size;
        const blob = f.slice(start, next);

        reader.onloadend = (event) => {
            if (event.target.readyState !== FileReader.DONE) {
                return;
            }

            if (!navigator.onLine) {
                offline_cache = {form, f, reader, next: 0, token};
                createAlert`L'upload reprendra lorse que vous serez reconnecté.`;
                return;
            }

            fetch(form.action, {
                method: form.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'dbi_upload_file',
                    file_data: event.target.result,
                    complete_size: f.size,
                    current_size: start + slice_size,
                    file: f.name,
                    file_type: f.type, 
                    token
                })
            }).then(r => r.json())
            .then(({ token = '' }) => {
                const size_done = start + slice_size;
                const percent_done = Math.floor((size_done / f.size) * 100);
                const progress = container.querySelector('form > progress');

                if (next < f.size) {
                    progress.setAttribute('value', percent_done);
                    progress.setAttribute('data-percent', `${percent_done}%`);

                    if (!navigator.onLine) {
                        offline_cache = {form, f, reader, next, token};
                        createAlert`L'upload reprendra lorse que vous serez reconnecté.`;
                        return;
                    }
                    upload(form, f, reader, next, token);
                } else {
                    progress.setAttribute('value', 100);
                    progress.setAttribute('data-percent', '100%');
                    // const buff = new Blob(btoa(token.replace(/^data:application\/\w+;base64,/g, '')));
                    
                    container.querySelector('iframe').setAttribute('src', token);
                    // alert(token);
                }
            }).catch(err => {
                offline_cache = {form, f, reader, next, token};
                createAlert`L'upload reprendra lorse que vous serez reconnecté.`;
                console.log(err.message);
            });
        };

        reader.readAsDataURL(blob);
    };

    container.querySelector('form').addEventListener('submit', e => {
        e.preventDefault();
        start_uplaod(e);
    });
};
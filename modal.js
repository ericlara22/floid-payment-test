class Modal {
    constructor() {
        this.eventCallbacks = {}; // Object to store callbacks for events
    }

    addStyles() {
        const styles = `
            .modal {
                display: none;
                position: fixed;
                z-index: 10000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgb(0,0,0);
                background-color: rgba(0,0,0,0.4);
                justify-content: center;
                align-items: center;
            }
            .modal-content {
                position: relative;
                background-color: #FEFEFE;
                margin: auto;
                padding: 0;
                border: 1px solid #888;
                width: 430px;
                max-width: 600px;
            }
            iframe {
                width: 100%;
                height: 750px;
                border: none;
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }

    createModal() {
        return;
    }

    open(token) {
        try {
            // Create modal elements
            this.modal = document.createElement('div');
            this.modalContent = document.createElement('div');
            this.iframe = document.createElement('iframe');
            // Set modal attributes
            this.modal.setAttribute('id', 'myModal');
            this.modal.setAttribute('class', 'modal');
            this.modalContent.setAttribute('class', 'modal-content');
            this.iframe.setAttribute('id', 'modalIframe');
            this.iframe.setAttribute('src', '');

            // Build the URL using the token
            this.iframe.src = `https://payments.floid.app/?id=${token}`;


            // Append elements
            this.modalContent.appendChild(this.iframe);
            this.modal.appendChild(this.modalContent);
            document.body.appendChild(this.modal);
            // Add CSS styles
            this.addStyles();

            this.addEventListeners(); // Added to handle iframe events

            this.modal.style.zIndex = '100000';
            this.modal.style.display = 'flex';
        } catch (error) {
            throw new Error('No se pudo iniciar el pago');
        }
    }

    close() {
        this.modal.style.display = 'none';
        this.iframe.src = '';
        this.trigger('close'); // Trigger the close event
    }

    addEventListeners() {
        window.addEventListener('message', (event) => {
            console.log('Received message:', event.data, 'from:', event.origin);
            // Execute callbacks associated with the received event
            if (this.eventCallbacks[event.data]) {
                this.eventCallbacks[event.data].forEach(callback => callback(event));
            }
        });
    }

    // Method to add callbacks for specific events
    on(event, callback) {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);
    }

    // Method to trigger events
    trigger(event) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => callback());
        }
    }
}
// Create an instance of Modal
const modalInstance = new Modal();
// Function that returns an object similar to jQuery AJAX calls
function FloidModal(token) {
    return {
        open: () => modalInstance.open(token),
        on: (event, callback) => modalInstance.on(event, callback),
        close: () => modalInstance.close()
    };
}
// Export the function globally
window.FloidModal = FloidModal;
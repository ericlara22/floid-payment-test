class Modal {
    constructor() {
        this.eventCallbacks = {}; // Object to store callbacks for events
    }

    addStyles(targetDoc) {
        const styles = `
            #myModal {
                display: flex;
                position: fixed;
                z-index: 2147483647;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                background-color: rgba(0,0,0,0.5);
                justify-content: center;
                align-items: center;
                animation: modalFadeIn 0.25s ease;
            }
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            #myModal .modal-content {
                position: relative;
                background-color: #fff;
                margin: 16px;
                padding: 0;
                border-radius: 16px;
                width: 100%;
                max-width: 430px;
                max-height: calc(100vh - 32px);
                box-shadow: 0 24px 48px rgba(0,0,0,0.2);
                animation: modalSlideIn 0.3s ease;
            }
            @keyframes modalSlideIn {
                from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            #myModal iframe {
                width: 100%;
                height: 750px;
                max-height: calc(100vh - 32px);
                border: none;
                border-radius: 0 0 16px 16px;
            }
        `;
        const styleSheet = document.createElement('style');
        styleSheet.type = 'text/css';
        styleSheet.innerText = styles;
        styleSheet.id = 'floid-modal-styles';
        targetDoc.head.appendChild(styleSheet);
    }

    createModal() {
        return;
    }

    open(token) {
        try {
            const targetDoc = (window.parent !== window) ? window.parent.document : document;
            const targetBody = targetDoc.body;

            // Create modal elements
            this.modal = targetDoc.createElement('div');
            this.modalContent = targetDoc.createElement('div');
            this.iframe = targetDoc.createElement('iframe');
            this.modal.setAttribute('id', 'myModal');
            this.modal.setAttribute('class', 'modal');
            this.modalContent.setAttribute('class', 'modal-content');
            this.iframe.setAttribute('id', 'modalIframe');
            this.iframe.setAttribute('src', '');

            this.iframe.src = `https://payments.floid.app/?id=${token}`;

            this.modalContent.appendChild(this.iframe);
            this.modal.appendChild(this.modalContent);
            targetBody.appendChild(this.modal);

            this.addStyles(targetDoc);
            this.addEventListeners();

            this.modal.style.display = 'flex';
        } catch (error) {
            throw new Error('No se pudo iniciar el pago');
        }
    }

    close() {
        if (this.modal) {
            this.modal.style.display = 'none';
            this.iframe.src = '';
            this.modal.remove();
            const targetDoc = (window.parent !== window) ? window.parent.document : document;
            const styles = targetDoc.getElementById('floid-modal-styles');
            if (styles) styles.remove();
        }
        if (this._messageTarget && this._messageHandler) {
            this._messageTarget.removeEventListener('message', this._messageHandler);
        }
        this.trigger('close');
    }

    addEventListeners() {
        const targetWindow = (window.parent !== window) ? window.parent : window;
        const handleMessage = (event) => {
            if (event.data && event.data.status === 'PAYMENT_CLOSED') {
                this.close();
            }
            if (this.eventCallbacks[event.data]) {
                this.eventCallbacks[event.data].forEach(callback => callback(event));
            }
        };
        targetWindow.addEventListener('message', handleMessage);
        this._messageHandler = handleMessage;
        this._messageTarget = targetWindow;
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
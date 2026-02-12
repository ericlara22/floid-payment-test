class Modal {
    constructor() {
        this.eventCallbacks = {};
    }

    addStyles(targetDoc) {
        const styles = `
            #myModal {
                display: flex;
                position: fixed;
                z-index: 2147483647;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                min-height: 100dvh;
                min-height: -webkit-fill-available;
                overflow: auto;
                -webkit-overflow-scrolling: touch;
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
                max-height: calc(100dvh - 32px);
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
                max-height: calc(100dvh - 32px);
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
            const targetDoc = document;
            const targetBody = targetDoc.body;

            // Bloquear scroll del body
            const scrollY = window.scrollY;
            targetBody.style.overflow = 'hidden';
            targetBody.style.position = 'fixed';
            targetBody.style.top = `-${scrollY}px`;
            targetBody.style.left = '0';
            targetBody.style.right = '0';

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

            const targetBody = document.body;
            const scrollY = targetBody.style.top;
            targetBody.style.overflow = '';
            targetBody.style.position = '';
            targetBody.style.top = '';
            targetBody.style.left = '';
            targetBody.style.right = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }

            const styles = document.getElementById('floid-modal-styles');
            if (styles) styles.remove();
        }
        if (this._messageTarget && this._messageHandler) {
            this._messageTarget.removeEventListener('message', this._messageHandler);
        }
        this.trigger('close');
    }

    addEventListeners() {
        const handleMessage = (event) => {
            if (event.data && event.data.status === 'PAYMENT_CLOSED') {
                this.close();
            }
            if (this.eventCallbacks[event.data]) {
                this.eventCallbacks[event.data].forEach(callback => callback(event));
            }
        };
        window.addEventListener('message', handleMessage);
        this._messageHandler = handleMessage;
        this._messageTarget = window;
    }

    on(event, callback) {
        if (!this.eventCallbacks[event]) {
            this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);
    }

    trigger(event) {
        if (this.eventCallbacks[event]) {
            this.eventCallbacks[event].forEach(callback => callback());
        }
    }
}

const modalInstance = new Modal();

function FloidModal(token) {
    return {
        open: () => modalInstance.open(token),
        on: (event, callback) => modalInstance.on(event, callback),
        close: () => modalInstance.close()
    };
}

window.FloidModal = FloidModal;

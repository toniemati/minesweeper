import { UI } from './UI.js';

export class Modal extends UI {
    buttonText = '';
    infoText = '';
    element = this.getElement(this.Uiselectors.modal);
    button = this.getElement(this.Uiselectors.modalButton);
    header = this.getElement(this.Uiselectors.modalHeader);

    toggleModal = () => {
        this.element.classList.toggle('hide');
    }

    setText() {
        this.header.textContent = this.infoText;
        this.button.textContent = this.buttonText;
    }
}
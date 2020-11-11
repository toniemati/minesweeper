export class UI {
    Uiselectors = {
        board: '[data-board]',
        cell: '[data-cell]',
        counter: '[data-counter]',
        timer: '[data-timer]',
        resetButton: '[data-button-reset]',
        easyButton: '[data-button-easy]',
        normalButton: '[data-button-normal]',
        expertButton: '[data-button-expert]',
        modal: '[data-modal]',
        modalHeader: '[data-modal-header]',
        modalButton: '[data-modal-button]',

        //* custom
        customButton: '[data-custom-button]',
        customRows: '[data-custom-rows]',
        customCols: '[data-custom-cols',
        customMines: '[data-custom-mines]',

        //* secret
        secret: '[data-secret]',
        secretCode: '[data-secret-code]',
        secretButton: '[data-secret-button]',
    }

    getElement(selector) {
        return document.querySelector(selector);
    }

    getElements(selector) {
        return document.querySelectorAll(selector);
    }
}
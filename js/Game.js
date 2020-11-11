import { Cell } from './Cell.js';
import { UI } from './UI.js';
import { Counter } from './Counter.js';
import { Timer } from './Timer.js';
import { ResetButton } from "./ResetButton.js";
import { Modal } from './Modal.js';

class Game extends UI {

    #config = {
        easy: {
            rows: 8,
            cols: 8,
            mines: 10
        },
        normal: {
            rows: 16,
            cols: 16,
            mines: 40
        },
        expert: {
            rows: 16,
            cols: 30,
            mines: 99
        },
        custom: {
            rows: 5,
            cols: 5,
            mines: 1,
        }
    }

    #counter = new Counter();
    #timer = new Timer();
    #modal = new Modal();

    #isGameFinished = false;

    #numberOfRows = null;
    #numberOfCols = null;
    #numberOfMines = null;

    #cells = [];
    #cellsElement = null;
    #cellsToReveal = 0;
    #revealedCells = 0;

    #board = null;

    #customErrors = null;

    #buttons = {
        modal: null,
        easy: null,
        normal: null,
        expert: null,
        reset: new ResetButton(),

        //* custom
        custom: null,
    }

    initializeGame() {
        this.#handleElements();
        this.#counter.init();
        this.#timer.init();
        this.#addButtonsEventListeners();
        this.#newGame();
    }

    #newGame(
        rows = this.#config.easy.rows,
        cols = this.#config.easy.cols,
        mines = this.#config.easy.mines,
    ) {
        this.#numberOfRows = rows;
        this.#numberOfCols = cols;
        this.#numberOfMines = mines;

        this.#counter.setValue(this.#numberOfMines);
        this.#timer.resetTimer();

        this.#cellsToReveal = (this.#numberOfCols * this.#numberOfRows) - this.#numberOfMines;

        this.#setStyles();

        this.#generateCells();
        this.#renderBoard();
        this.#placeMinesInCells();

        this.#cellsElement = this.getElements(this.Uiselectors.cell);

        this.#buttons.reset.changeEmotion('neutral');

        this.#isGameFinished = false;
        this.#revealedCells = 0;

        this.#addCellsEventListener();
    }

    #endGame(isWin) {
        this.#isGameFinished = true;
        this.#timer.stopTimer();
        this.#modal.buttonText = 'Close';

        if (!isWin) {
            this.#revealMines();
            this.#modal.infoText = 'You lost, try again!';
            this.#buttons.reset.changeEmotion('negative');
            this.#modal.setText();
            this.#modal.toggleModal();
            return;
        }

        this.#modal.infoText = this.#timer.numberOfSeconds < this.#timer.maxNumberOfSeconds ?
            `You win, it took you ${this.#timer.numberOfSeconds} seconds, congratulations!` : 'You won, congratulations!';
        this.#buttons.reset.changeEmotion('positive');
        this.#modal.setText();
        this.#modal.toggleModal();
    }

    #handleElements() {
        this.#board = this.getElement(this.Uiselectors.board);
        this.#buttons.modal = this.getElement(this.Uiselectors.modalButton);
        this.#buttons.easy = this.getElement(this.Uiselectors.easyButton);
        this.#buttons.normal = this.getElement(this.Uiselectors.normalButton);
        this.#buttons.expert = this.getElement(this.Uiselectors.expertButton);

        //* cutom
        this.#buttons.custom = this.getElement(this.Uiselectors.customButton);
    }

    #addCellsEventListener() {
        this.#cellsElement.forEach((element) => {
            element.addEventListener('click', this.#handleCellClick)
            element.addEventListener('contextmenu', this.#handleCellContextMenu)
        })
    }

    #addButtonsEventListeners() {
        this.#buttons.modal.addEventListener('click', this.#modal.toggleModal);

        this.#buttons.custom.addEventListener('click', () => this.#setCustomValue())

        this.#buttons.easy.addEventListener('click', () =>
            this.#handleNewGameClick(
                this.#config.easy.rows,
                this.#config.easy.cols,
                this.#config.easy.mines
            ),
        );

        this.#buttons.normal.addEventListener('click', () =>
            this.#handleNewGameClick(
                this.#config.normal.rows,
                this.#config.normal.cols,
                this.#config.normal.mines
            ),
        );

        this.#buttons.expert.addEventListener('click', () =>
            this.#handleNewGameClick(
                this.#config.expert.rows,
                this.#config.expert.cols,
                this.#config.expert.mines
            ),
        );

        this.#buttons.reset.element.addEventListener('click', () =>
            this.#handleNewGameClick(),
        );

    }

    #removeCellsEventListeners() {
        this.#cellsElement.forEach((element) => {
            element.removeEventListener('click', this.#handleCellClick)
            element.removeEventListener('contextmenu', this.#handleCellContextMenu)
        })
    }

    #handleNewGameClick(
        rows = this.#numberOfRows,
        cols = this.#numberOfCols,
        mines = this.#numberOfMines
    ) {
        this.#removeCellsEventListeners();
        this.#newGame(rows, cols, mines)
    }

    #generateCells() {
        this.#cells.length = 0;
        for (let row = 0; row < this.#numberOfRows; row++) {
            this.#cells[row] = [];
            for (let col = 0; col < this.#numberOfCols; col++) {
                this.#cells[row].push(new Cell(col, row));
            }
        }
    };

    #renderBoard() {
        while (this.#board.firstChild) {
            this.#board.removeChild(this.#board.lastChild)
        }
        this.#cells.flat().forEach((cell) => {
            this.#board.insertAdjacentHTML('beforeend', cell.createElement());
            cell.element = cell.getElement(cell.selector);
        });
    }

    #placeMinesInCells() {
        let minesToPlace = this.#numberOfMines;

        while (minesToPlace) {
            const rowIndex = this.#getRandomIntiger(0, this.#numberOfRows - 1);
            const colIndex = this.#getRandomIntiger(0, this.#numberOfCols - 1);

            const cell = this.#cells[rowIndex][colIndex];

            const hasCellMine = cell.isMine;

            if (!hasCellMine) {
                cell.addMine();
                minesToPlace--;
            }
        }
    }

    #handleCellClick = (e) => {
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'), 10);
        const colIndex = parseInt(target.getAttribute('data-x'), 10);

        const cell = this.#cells[rowIndex][colIndex];

        this.#clickCell(cell);
    }

    #handleCellContextMenu = (e) => {
        e.preventDefault()
        const target = e.target;
        const rowIndex = parseInt(target.getAttribute('data-y'), 10);
        const colIndex = parseInt(target.getAttribute('data-x'), 10);

        const cell = this.#cells[rowIndex][colIndex];

        if (cell.isReveal || this.#isGameFinished) return;

        if (cell.isFlagged) {
            this.#counter.increment();
            cell.toggleFlag();
            return;
        }

        if (!!this.#counter.value) {
            this.#counter.decrement();
            cell.toggleFlag();
            return;
        }

    }

    #clickCell(cell) {
        if (this.#isGameFinished || cell.isFlagged) return;

        if (cell.isMine) {
            this.#endGame(false);
        }

        this.#setCellValue(cell);

        if (this.#revealedCells === this.#cellsToReveal && !this.#isGameFinished) {
            this.#endGame(true);
        }
    }

    #revealMines() {
        this.#cells
            .flat()
            .filter(({ isMine }) => isMine)
            .forEach((cell) => cell
                .revealCell())
    }

    #checkCustomValue(rows, cols, mines) {
        this.#customErrors = 0;

        if (rows < 5 || rows > 20) {
            this.#customErrors += 1;
        }
        if (cols < 7 || cols > 40) {
            this.#customErrors += 1;
        }
        if (mines < 1 || mines > (cols * rows) - 1) {
            this.#customErrors += 1;
        }
    }

    #setCustomValue() {
        this.#config.custom.rows = this.getElement(this.Uiselectors.customRows).value;
        this.#config.custom.cols = this.getElement(this.Uiselectors.customCols).value;
        this.#config.custom.mines = this.getElement(this.Uiselectors.customMines).value;

        this.#checkCustomValue(
            this.#config.custom.rows,
            this.#config.custom.cols,
            this.#config.custom.mines
        );

        if (this.#customErrors === 0) {
            this.#handleNewGameClick(
                this.#config.custom.rows,
                this.#config.custom.cols,
                this.#config.custom.mines
            );
        } else {
            alert(`Rows between 5-20, cols between 7-40, mines between 1-${this.#config.custom.rows * this.#config.custom.cols - 1}`);
        }


    }

    #setCellValue(cell) {
        let minesCount = 0;

        for (
            let rowIndex = Math.max(cell.y - 1, 0);
            rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1);
            rowIndex++
        ) {
            for (
                let colIndex = Math.max(cell.x - 1, 0);
                colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1);
                colIndex++
            ) {
                if (this.#cells[rowIndex][colIndex].isMine) minesCount++;
            }
        }
        cell.value = minesCount;
        cell.revealCell();
        this.#revealedCells++;

        if (!cell.value) {
            for (
                let rowIndex = Math.max(cell.y - 1, 0);
                rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1);
                rowIndex++
            ) {
                for (
                    let colIndex = Math.max(cell.x - 1, 0);
                    colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1);
                    colIndex++
                ) {
                    const cell = this.#cells[rowIndex][colIndex];
                    if (!cell.isReveal) {
                        this.#clickCell(cell)
                    }
                }
            }
        }

    }

    #setStyles() {
        document.documentElement.style.setProperty('--cells-in-row', this.#numberOfCols);
    }

    #getRandomIntiger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

}

window.onload = function () {
    const game = new Game();
    game.initializeGame();
}
"use strict";
export class BoardElement extends HTMLElement {
    constructor() {
        super();
        this.pointerdown = false;
        this.cellArr = [...Array(9)].map(v => [...Array(9)].map(d => null));
        console.log(JSON.stringify(this.cellArr));
        const rows = document.createElement("div");
        rows.classList.add("board-element");
        for (let i = 0; i < 9; i++) {
            const newRow = document.createElement("div");
            newRow.classList.add("cell-row-element");
            for (let j = 0; j < 9; j++) {
                const newCell = this.createCell(i, j);
                newRow.appendChild(newCell);
                this.cellArr[i][j] = newCell;
                newCell.addEventListener("pointerenter", handleHover(this, i, j));
                newCell.addEventListener("pointerleave", handleHoverLeave(this, i, j));
                newCell.addEventListener("pointerdown", handlePointerDown(this, i, j));
                newCell.addEventListener("pointerup", handlePointerUp(this, i, j));
                newCell.addEventListener("pointercancel", handlePointerCancel(this, i, j));
            }
            rows.appendChild(newRow);
        }
        this.appendChild(rows);
    }

    getCell(x, y) {
        const cell = this.cellArr[x][y];
        return cell;
    }

    createCell(x, y) {
        const el = document.createElement("div");
        el.classList.add("cell-element");
        el.style.fontSize = "2rem";
        const number = document.createElement("span");
        number.classList.add("big-number")
        el.appendChild(number);
        const bottomText = document.createElement("span");
        bottomText.classList.add("bottom-text");
        el.appendChild(bottomText);
        bottomText.style.fontSize = "0.3rem";
        return el;
    }
    setCellVal(x, y, val) {
        //console.log(`(${x},${y}) -> ${val}`);
        this.getCell(x, y).children[0].textContent = val;
    }
    setCellClass(x, y, ...classes) {
        this.getCell(x, y).classList.add(...classes);
    }
    removeCellClass(x, y, ...classes) {
        this.getCell(x, y).classList.remove(...classes);
    }
}

const handleHover = (board, coordX, coordY) => (ev) => {
    board.setCellClass(coordX, coordY, "hover")
    if (board.pointerdown) {
        board.dispatchEvent(createSelectEvent(coordX, coordY, board));
    }
}

const handleHoverLeave = (board, coordX, coordY) => (ev) => {
    board.removeCellClass(coordX, coordY, "hover");
}

/**
 * 
 * @param {BoardElement} board 
 * @param {number} coordX 
 * @param {number} coordY 
 * @returns 
 */
const handlePointerDown = (board, coordX, coordY) => (ev) => {
    console.log("Pointer is DOWN!");
    board.pointerdown = true;
    board.dispatchEvent(createBeginSelectionEvent(coordX, coordY, board));
}
const handlePointerUp = (board, coordX, coordY) => (ev) => {
    board.pointerdown = false;
    board.dispatchEvent(createEndSelectionEvent(coordX, coordY, board));

}
const handlePointerCancel = (board, coordX, coordY) => (ev) => {
    board.pointerdown = false;
    board.dispatchEvent(createEndSelectionEvent(coordX, coordY, board));
}


const createBeginSelectionEvent = (coordX, coordY, board) => {
    return createEvent("beginSelection", coordX, coordY, board);
}
const createEndSelectionEvent = (coordX, coordY, board) => {
    return createEvent("endSelection", coordX, coordY, board);
}
const createSelectEvent = (coordX, coordY, board) => {
    return createEvent("selectCell", coordX, coordY, board);
}

/**
 * 
 * @param {string} evType 
 * @param {number} coordX 
 * @param {number} coordY 
 * @param {BoardElement} board 
 * @returns 
 */
const createEvent = (evType, coordX, coordY, board) => {
    return new CustomEvent(evType, {
        detail: {
            "x": coordX,
            "y": coordY,
            "element": board.getCell(coordX, coordY)
        },
        bubbles: true,
        cancelable: true
    });
}

customElements.define("board-element", BoardElement);
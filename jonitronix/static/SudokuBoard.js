import { BoardElement } from "./BoardElement.js";
import { BoardArray } from "./sudokuarr.js";

export class SudokuBoard {
    constructor() {
        this.htmlParent = new BoardElement();
        this.selectMode = "single";
        this.boardArray = new BoardArray();
        this.selected = new CoordinateList();
        this.selectAction = this.selectCell;
        
        this.htmlParent.addEventListener("beginSelection", (ev) => {
            const wasSelected = this.selected.exists(ev.detail.x, ev.detail.y);
            if (wasSelected) {
                this.selectAction = this.deselectCell;
            }
            else {
                this.selectAction = this.selectCell;
            }
            if (this.selectMode === "single") {
                this.deselectAll();
            }
            this.selectAction(ev.detail.x, ev.detail.y);
        });
        this.htmlParent.addEventListener("selectCell", (ev) => {
            this.selectAction(ev.detail.x, ev.detail.y);
        })
    }
    reset() {
        this.boardArray = new BoardArray();
        this.render();
    }
    setBoard(boardstring) {
        this.boardArray = BoardArray.fromString(boardstring);
        this.render();
    }
    deselectCell(x, y) {
        this.selected.remove(x, y);
        this.render();
    }
    selectCell(x, y) {
        this.selected.add(x, y);
        this.render();
    }
    deselectAll() {
        this.selected = new CoordinateList();
        this.render()
    }
    enterNumberToSelected(num) {
        let allTheNum = true;
        for (const {x, y} of this.selected.list) {
            if (this.boardArray.getCell(x, y).other.immutable === true) {
                continue;
            }
            if (this.boardArray.getCell(x, y).content !== num) {
                allTheNum = false;
            }
            this.boardArray.placeVal(x, y, num);
        }
        if (allTheNum) {
            this.deleteContentFromSelected()
            return;
        }
        this.render();
     }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @param {number} num 
     */
    enterNumber(x, y, num) {
        if (this.boardArray.getCell(x, y).other.immutable) {
            return;
        }
        this.boardArray.placeVal(x, y, num);
        this.render()
    }

    deleteContentFromSelected() {
        console.log("Deleting!");
        for (const {x, y} of this.selected.list) {
            if (this.boardArray.getCell(x, y).other.immutable) {
                continue;
            }
            this.boardArray.placeVal(x, y, null);
        }
        this.render();

    }
    render() {
        console.log("Render called");
        for (const [cell, row, col, box] of this.boardArray.iterateCells()) {
            const htmlCell = this.htmlParent.getCell(col, row);
            if (cell.content && cell.seenCount[cell.content] > 0) {
                htmlCell.classList.add("illegal");
            }
            else {
                htmlCell.classList.remove("illegal");
            }
            if (cell.other.immutable) {
                htmlCell.classList.add("immutable");
            }
            else {
                htmlCell.classList.remove("immutable");
            }
            
            htmlCell.classList.remove("affected");
            const cellCoords = { "x": col, "y": row };
            for (const selectedCell of this.selected.list) {
                if (!this.boardArray.cellsSeeEachOther(cellCoords, selectedCell) && !(selectedCell.x === col && selectedCell.y === row)) {
                    htmlCell.classList.remove("affected");
                    break;
                }
                htmlCell.classList.add("affected");
            }
            this.htmlParent.setCellVal(col, row, cell.content);
            //htmlCell.children[1].textContent = JSON.stringify(cell.seenCount);
            if (this.selected.list.find(s => s.x === col && s.y === row)) {
                htmlCell.classList.add("selected");
            }
            else {
                htmlCell.classList.remove("selected");
            }
        }
    }
    *iterValues() {
        for (let x = 0; x<9; x++) {
            for (let y = 0; y<9; y++) {
                yield [this.boardArray.getCell(x, y).content, x, y];
            }
        }
    }
}


class CoordinateList {

    constructor() {
        this.list = [];
    }

    add(x, y) {
        if (typeof x !== "number" || typeof y !== "number") {
            throw "HAHAA";
        }
        if (this.exists(x, y)) {
            return;
        }
        this.list.push({x, y});
    }
    
    remove(x, y) {
        this.list = this.list.filter(val => val.x !== x || val.y !== y);
    }

    exists(x, y) {
        return this.list.some(val => val.x === x && val.y === y);
    }
}
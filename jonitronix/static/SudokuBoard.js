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
        this.htmlParent = new BoardElement();
        this.boardArray = new BoardArray();
        this.render();
    }
    setBoard(boardstring) {
        this.boardArray = BoardArray.
    }
    deselectCell(x, y) {
        this.htmlParent.getCell(x, y).classList.remove("selected");
        this.selected.remove(x, y);
    }
    selectCell(x, y) {
        this.htmlParent.getCell(x, y).classList.add("selected");
        this.selected.add(x, y);
    }
    deselectAll() {
        for (const {x, y} of this.selected.list) {
            this.htmlParent.getCell(x, y).classList.remove("selected");
        }
        this.selected = new CoordinateList();
    }
    enterNumberToSelected(num) {
        let allTheNum = true;
        for (const {x, y} of this.selected.list) {
            if (getCell(this.boardArray, y, x).content !== num) {
                allTheNum = false;
            }
            this.boardArray = placeNumber(this.boardArray, y, x, num);
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
        this.boardArray = placeNumber(this.boardArray, y, x, num);
        this.render()
    }

    deleteContentFromSelected() {
        console.log("Deleting!");
        this.boardArray = deleteEntries(this.boardArray, ...this.selected.list);
        this.render();

    }
    render() {
        console.log("Render called");
        for (const [cell, row, col, box] of iterateCells(this.boardArray)) {
            const htmlCell = this.htmlParent.getCell(col, row);
            if (cell.content && !cell.possibleValues.some(v => v === cell.content)) {
                htmlCell.classList.add("illegal");
            }
            else {
                htmlCell.classList.remove("illegal");
            }
            this.htmlParent.setCellVal(col, row, cell.content);
            htmlCell.children[1].textContent = JSON.stringify(cell.possibleValues);
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
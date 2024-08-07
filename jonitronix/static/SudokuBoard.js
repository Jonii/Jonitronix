// @ts-check

import { SudokuCell } from "./SudokuCell.js";



export class SudokuBoard {
    htmlParent;

    constructor() {
        this.htmlParent = this.createBoardElement();
        this.selectMode = "single";
        
    }



    reset() {
        for (let x = 0; x<9; x++) {
            for (let y = 0; y<9; y++) {
                const cell = this.getCell(x, y);
                if (cell === null) {
                    console.log("cells gone awol on the board");
                    return;
                }
                cell.selected = false;
                cell.modifiable = true;
                cell.delNumber();
            }
        }
    }

    /**
     * @param {string} boardstr
     */
    setBoard(boardstr) {
        const lines = boardstr.split("\n").map((s) => s.trim()).filter((s) => s.length > 9);
        console.log(lines);
        if (lines.length != 9) {
            console.log("Bad format");
            console.log(JSON.stringify(lines));
            return;
        }
        for (const [rownum, line] of lines.entries()) {
            console.log(`Parsing line ${rownum} '${line}'`);
            const lineSegments = line.split(/\s*[ |]\s*/);
            if (lineSegments.length !== 9) {
                console.log("Problem parsing");
                console.log(JSON.stringify(lineSegments));
                console.log(line);
                return;
            }
            for (const [colnum, entry] of lineSegments.entries()) {
                const cell = this.getCell(colnum, rownum);
                if (cell === null) {
                    console.log("cell gone awol");
                    return;
                }
                const fixedNumPtr = /^#([1-9])$/;
                const fixedNumMatch = fixedNumPtr.exec(entry);
                if (fixedNumMatch) {
                    const content = Number(fixedNumMatch[1]);
                    cell.setNumber(content);
                    cell.modifiable = false;
                    continue;
                }

                const modifiableNumPtr = /^[1-9]$/;
                const modifiableNumMatch = modifiableNumPtr.exec(entry);
                if (modifiableNumMatch) {
                    const content = Number(entry);
                    cell.setNumber(content);
                    cell.modifiable = true;
                    continue;
                }

                if (entry === "_") {
                    const content = "";
                    cell.delNumber();
                    cell.modifiable = true;
                    continue;
                }

            }
        }
        
    }
   
    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns {SudokuCell|null}
     */
    getCell(x, y) {
        const index = x + (y*9);
        // @ts-ignore
        return this.htmlParent.children.item(index);
    }

    createBoardElement() {
        const boardElem = document.createElement("div");
        boardElem.id = "board";
        /** @returns {Array<SudokuCell>} */
        const emptySudokuCellArr = (v) => [];
        const boxes = [...Array(9).keys()].map(emptySudokuCellArr);
        const rows = [...Array(9).keys()].map(emptySudokuCellArr);
        const columns = [...Array(9).keys()].map(emptySudokuCellArr);

        // Create 9 cells within each sub-grid
        for (let i = 0; i<81; i++) {
            const row = ~~(i/9);
            const column = i%9;
            const boxRow = ~~(row/3);
            const boxCol = ~~(column/3);
            const box = boxCol + (3 * boxRow);

            const cell = new SudokuCell(i%9, ~~(i/9));
            boxes[box].push(cell);
            rows[row].push(cell);
            columns[column].push(cell);
            
            // Add click event listener
            cell.addEventListener('click', this.clickHandler(cell));
            boardElem.appendChild(cell);
        }
        for (const connectedCells of rows.concat(columns, boxes)) {
            for (const cell of connectedCells) {
                for (const connectedCell of connectedCells) {
                    if (cell === connectedCell) {
                        continue;
                    }
                    cell.addRelation(connectedCell, (a, b) => {
                        if (a === null || b === null) {
                            return true;
                        }
                        return (a !== b);
                    })
                }
            }

        }
        return boardElem;
    }

    /**
     * 
     * @param {number} num 
     * @returns 
     */
    enterNumberToSelected(num) {
        /** @type {NodeListOf<SudokuCell>} */
        const selectedCells = this.htmlParent.querySelectorAll('sudoku-cell.modifiable.selected');
        console.log("inputting num " + num);
        if (selectedCells.length == 0) {
            console.log("No cell selected");
            return;
        }
        const allCellsHaveInputNumAlready = Array.from(selectedCells).every(function (selectedCell) {
            return selectedCell.number == num;
        });
        selectedCells.forEach((selectedCell) => {
            if (allCellsHaveInputNumAlready) {
                selectedCell.delNumber();
            }
            else {
                selectedCell.setNumber(num)
            }
        });
    }

    deleteContentFromSelected() {
        /** @type {NodeListOf<SudokuCell>}  */
        const selectedCells = this.htmlParent.querySelectorAll(".selected.modifiable");
        selectedCells.forEach((cell) => {
            cell.delNumber();
        })
    }

    dragHandler(event) {

    }
    clickHandler(cell) {
        return (event) => {
            if (this.selectMode === "multi") {
                cell.classList.toggle("selected");
                this.markAffectedBySelection();
                return
            }
            for (const selected of this.htmlParent.querySelectorAll(".selected")) {
                if (selected !== cell) {
                    selected.classList.remove("selected");
                }
            }
            cell.classList.toggle("selected");
            this.markAffectedBySelection();
        }
    }
    markAffectedBySelection() {
        /** @type {NodeListOf<SudokuCell>} */
        const allCells = this.htmlParent.querySelectorAll("sudoku-cell");
        for (const cell of allCells) {
            cell.affected = false;
        }
        let stillAffected = Array.from(allCells);
        let anySelected = false;
        for (let x = 0; x<9; x++) {
            for (let y = 0; y<9; y++) {
                if (!this.getCell(x, y)?.selected) {
                    continue
                }
                anySelected = true;
                const row = [...Array(9).keys()].map((i) => this.getCell(i, y));
                const col = [...Array(9).keys()].map((i) => this.getCell(x, i));
                const boxStartY = (~~(y/3)) * 3;
                const boxStartX = (~~(x/3)) * 3;
                const box = [0, 1, 2].flatMap(r => [0, 1, 2].map(c => ({"row": r + boxStartY, "column": c + boxStartX}))).map(s => this.getCell(s.column, s.row));
                
                stillAffected = stillAffected.filter(v => row.concat(col, box).includes(v));
            }
        }
        if (!anySelected) {
            return;
        }
        for (const cell of stillAffected) {
            cell.affected = true;
        }
    }
    verify() {
        const allCells = this.allCells();
        for (const cell of allCells) {
            cell.illegal = false;
            if (cell.checkRelations()) {
                continue;
            }
            cell.illegal = true;
        }
    }
    
    /**
     * 
     * @returns {NodeListOf<SudokuCell>}
     */
    allCells() {
        /** @type NodeListOf<SudokuCell> */ 
        const all = this.htmlParent.querySelectorAll("sudoku-cell");
        return all;
    }

    boxFor(cell) {
        return this.htmlParent.querySelectorAll(`sudoku-cell.${cell.boxId}`);
    }
    rowFor(cell) {
        return this.htmlParent.querySelectorAll(`sudoku-cell.${cell.rowId}`);
    }
    colFor(cell) {
        return this.htmlParent.querySelectorAll(`sudoku-cell.${cell.colId}`);
    }

}


// @ts-ignore
window.SudokuBoard = SudokuBoard;

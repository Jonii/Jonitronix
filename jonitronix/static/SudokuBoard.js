export class SudokuBoard {
    htmlParent;

    constructor() {
        this.htmlParent = this.createBoardElement();
        this.selectMode = "single";
        
    }

    reset() {
        for (let x = 0; x<9; x++) {
            for (let y = 0; y<9; y++) {
                const cell = this.htmlParent.querySelector(`#cell-${x}-${y}`);
                cell.classList = "cell modifiable";
                const numberContent = cell.querySelector(".number-content");
                numberContent.textContent = "";
            }
        }
    }

    /**
     * @param {string} boardstr
     */
    setBoard(boardstr) {
        const lines = boardstr.split("\n").map((s) => s.trim()).filter((s) => s.length == 17);
        console.log(lines);
        if (lines.length != 9) {
            console.log("Bad format");
            return;
        }
        for (let x = 0; x<9; x++) {
            for (let y = 0; y<9; y++) {
                const char = lines[y].charAt(2*x);
                if (char === "_") {
                    continue;
                }
                if (char <= "9" && char >= "1") {
                    const cell = this.htmlParent.querySelector(`#cell-${x}-${y}`);
                    cell.classList.remove("modifiable");
                    setCellValue(cell, char);
                    continue;
                }
                console.log("Problems on line " + lines[y] + " with char " + char);
            }
        }
    }
    

    createBoardElement() {
        const boardElem = document.createElement("div");
        boardElem.id = "board";
        // Create 9 sub-grids
        for (let subgridIndex = 0; subgridIndex < 9; subgridIndex++) {
            const subGrid = document.createElement('div');
            subGrid.className = 'subgrid';

            // Create 9 cells within each sub-grid
            for (let inBoxIndex = 0; inBoxIndex < 9; inBoxIndex++) {
                const {row: x, column: y} = this.getCellCoordinatesBySubgrid(subgridIndex, inBoxIndex);
                const cell = this.createCellElem(x, y);
                

                // Add click event listener
                cell.addEventListener('click', this.clickHandler(cell));

                subGrid.appendChild(cell);
            }
            boardElem.appendChild(subGrid);
        }
        return boardElem;
    }

    createCellElem(x, y) {
        const parent = document.createElement("div");
        parent.classList.add("cell", "modifiable");
        parent.id = `cell-${x}-${y}`;
        const border = document.createElement("div");
        parent.appendChild(border);
        border.classList.add("cell-border");
        const numberContent = document.createElement("div");
        border.appendChild(numberContent);
        numberContent.classList.add("number-content");
        return parent;

    }

    enterNumber(num) {
        const selectedCells = this.htmlParent.querySelectorAll('.modifiable.selected');
        console.log("inputting num " + num);
        if (selectedCells.length == 0) {
            console.log("No cell selected");
            return;
        }
        const allCellsHaveInputNumAlready = Array.from(selectedCells).every(function (selectedCell) {
            const cellValue = selectedCell.querySelector('.number-content')?.textContent;
            return cellValue == num;
        });
        selectedCells.forEach((selectedCell) => {
            if (allCellsHaveInputNumAlready) {
                setCellValue(selectedCell, "");
            }
            else {
                setCellValue(selectedCell, num);
            }
        });
    }

    deleteNumber() {
        const selectedCells = this.htmlParent.querySelectorAll(".selected.modifiable");
        selectedCells.forEach((cell) => {
            setCellValue(cell, "");
        })
    }

    dragHandler(event) {

    }
    clickHandler(cell) {
        return (event) => {
            if (this.selectMode === "multi") {
                cell.classList.toggle("selected");
                return
            }
            for (const selected of this.htmlParent.querySelectorAll(".selected")) {
                if (selected !== cell) {
                    selected.classList.remove("selected");
                }
            }
            cell.classList.toggle("selected");
        }
    }

    setCellLocationBySubgrid(cell, subgridIndex, inBoxIndex) {
        cell.id = `cell-${subgridIndex}-${inBoxIndex}`;
        cell.setAttribute('data-subgrid', subgridIndex);
        cell.setAttribute('data-in-box', inBoxIndex);
        const { row, column } = getCellCoordinatesBySubgrid(subgridIndex, inBoxIndex);
        cell.setAttribute('data-row', row);
        cell.setAttribute('data-column', column);
    }

    getCellCoordinatesBySubgrid(subgridIndex, inBoxIndex) {
        const row = Math.floor(subgridIndex / 3) * 3 + Math.floor(inBoxIndex / 3);
        const column = (subgridIndex % 3) * 3 + (inBoxIndex % 3);
        return { row, column };
    }
    getCellSubgridByCoordinates(row, column) {
        const subgridIndex = Math.floor(row / 3) * 3 + Math.floor(column / 3);
        const inBoxIndex = (row % 3) * 3 + (column % 3);
        return { subgridIndex, inBoxIndex };
    }
}

const setCellValue = (cell, val) => {
    cell.querySelector(".number-content").textContent = val;
}

window.SudokuBoard = SudokuBoard;

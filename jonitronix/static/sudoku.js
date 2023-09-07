let isPainting = false;
let isCtrlPressed = false;

document.addEventListener('keydown', function (e) {
    const selectedCells = document.querySelectorAll('.selected');
    const inputNum = e.key;
    if (inputNum >= '1' && inputNum <= '9') {
        putNumber(parseInt(inputNum));
    }
    if (inputNum == 'Backspace') {
        console.log("Deleting number");
        if (selectedCells.length == 0) {
            console.log("No cell selected");
            return;
        }

        selectedCells.forEach(function (selectedCell) {
            selectedCell.querySelector('.number-content.modifiable').textContent = '';
        });
        verifyBoard();
    }
});

function putNumber(num) {
    const selectedCells = document.querySelectorAll('.selected');
    console.log("inputting num " + num);
    if (selectedCells.length == 0) {
        console.log("No cell selected");
        return;
    }
    const allCellsHaveInputNumAlready = Array.from(selectedCells).every(function (selectedCell) {
        const cellValue = selectedCell.querySelector('.number-content').textContent;
        return cellValue == num;
    });
    selectedCells.forEach(function (selectedCell) {
        if (allCellsHaveInputNumAlready) {
            selectedCell.querySelector('.number-content.modifiable').textContent = '';
        }
        else {
            selectedCell.querySelector('.number-content.modifiable').textContent = num;
        }
    });
    verifyBoard();
}


document.addEventListener('DOMContentLoaded', function () {
    const board = document.getElementById('board');
    const cellTemplate = document.getElementById('cell-template').content;

    // Create 9 sub-grids
    for (let subgridIndex = 0; subgridIndex < 9; subgridIndex++) {
        const subGrid = document.createElement('div');
        subGrid.className = 'subgrid';

        // Create 9 cells within each sub-grid
        for (let inBoxIndex = 0; inBoxIndex < 9; inBoxIndex++) {
            const cell = cellTemplate.cloneNode(true).querySelector('.cell');
            setCellLocationBySubgrid(cell, subgridIndex, inBoxIndex);

            // Add click event listener
            cell.addEventListener('click', function () {
                // Remove selected class from all cells
                const selectedCells = document.querySelectorAll('.selected');
                const singleCellSelected = selectedCells.length == 1;
                if (!isCtrlPressed) {
                    selectedCells.forEach(deSelectCell);
                }

                const allCells = document.querySelectorAll('.cell');
                
                if (singleCellSelected && selectedCells[0] == cell) {
                    deSelectCell(cell);
                } else {
                    toggleCell(cell);
                }
                const newlySelectedCells = Array.from(document.querySelectorAll('.selected'));
                if (newlySelectedCells.length > 0) {
                    allCells.forEach(function (cell) {
                        cell.classList.add('affected');
                    });
                    newlySelectedCells.forEach(shadeAffectedCells);
                } else {
                    allCells.forEach(function (cell) {
                        cell.classList.remove('affected');
                    });
                }
            });

            subGrid.appendChild(cell);
        }
        board.appendChild(subGrid);
    }

    // Handle number button clicks
    const numberButtons = document.querySelectorAll('.number');
    numberButtons.forEach(button => {
      button.addEventListener('click', function() {
        console.log('Button clicked:', this.getAttribute('data-number'));
        putNumber(parseInt(this.getAttribute('data-number')));
      });
    });
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Control') {
        isCtrlPressed = true;
    }
});

document.addEventListener('keyup', function (e) {
    if (e.key === 'Control') {
        isCtrlPressed = false;
    }
});

function getRowValues(row) {
    console.log("Getting row values for row " + row);
    const cells = getRowById(row);
    const values = [];
    cells.forEach(function (cell) {
        const value = parseInt(cell.querySelector('.number-content').textContent);
        values.push(value);
    });
    return values;
}
function getBoxValues(box) {
    const cells = getBoxById(box);
    const values = [];
    cells.forEach(function (cell) {
        const value = parseInt(cell.querySelector('.number-content').textContent);
        values.push(value);
    });
    return values;
}
function getColumnValues(column) {
    const cells = getColumnById(column);
    const values = [];
    cells.forEach(function (cell) {
        const value = parseInt(cell.querySelector('.number-content').textContent);
        values.push(value);
    });
    return values;
}
function getValue(x, y) {
    const cell = getCell(x, y);
    const value = parseInt(cell.querySelector('.number-content').textContent);
    return value;
}
function verifyBoard() {
    
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = getCell(i, j);
            cell.classList.remove('invalid');
            console.log(`Checking cell (${i}, ${j})`);
            const value = getValue(i, j);
            if (isNaN(value)) {
                continue;
            }
            const rowValues = getRowValues(i).toSpliced(j, 1);
            const columnValues = getColumnValues(j).toSpliced(i, 1);
            const boxValues = getBoxValues(getCellSubgridByCoordinates(i, j).subgridIndex).toSpliced(getCellSubgridByCoordinates(i, j).inBoxIndex, 1);
            if (rowValues.includes(value) || columnValues.includes(value) || boxValues.includes(value)) {
                console.log("Coordinate " + i + ", " + j + " is invalid");
                cell.classList.add('invalid');
            }
        }
    }
    console.log("Board checked");
}

function selectCell(cell) {
    cell.classList.add('selected');
    console.log("Selected cell " + getCoordinates(cell));
}
function toggleCell(cell) {
    cell.classList.toggle('selected');
    if (cell.classList.contains('selected')) {
        console.log("Selected cell " + getCoordinates(cell));
    } else {
        console.log("Deselected cell " + getCoordinates(cell));
    }
}

function shadeAffectedCells(cell) {
    const affectedCells = getRowByCell(cell).concat(getColumnByCell(cell), getBoxByCell(cell));
    const allCells = Array.from(document.querySelectorAll('.cell'));
    const unAffectedCells = allCells.filter(cell => !affectedCells.includes(cell));
    //printCells(unAffectedCells);
    unAffectedCells.forEach(function (unAffectedCell) {
        unAffectedCell.classList.remove('affected');
    });
}

function deSelectCell(cell) {
    cell.classList.remove('selected');
    console.log("Deselected cell " + getCoordinates(cell));
}

function setCellLocationBySubgrid(cell, subgridIndex, inBoxIndex) {
    cell.id = `cell-${subgridIndex}-${inBoxIndex}`;
    cell.setAttribute('data-subgrid', subgridIndex);
    cell.setAttribute('data-in-box', inBoxIndex);
    const { row, column } = getCellCoordinatesBySubgrid(subgridIndex, inBoxIndex);
    cell.setAttribute('data-row', row);
    cell.setAttribute('data-column', column);
}

function getCellCoordinatesBySubgrid(subgridIndex, inBoxIndex) {
    const row = Math.floor(subgridIndex / 3) * 3 + Math.floor(inBoxIndex / 3);
    const column = (subgridIndex % 3) * 3 + (inBoxIndex % 3);
    return { row, column };
}
function getCellSubgridByCoordinates(row, column) {
    const subgridIndex = Math.floor(row / 3) * 3 + Math.floor(column / 3);
    const inBoxIndex = (row % 3) * 3 + (column % 3);
    return { subgridIndex, inBoxIndex };
}

// Test location conversion
for (i = 0; i < 9; i++) {
    for (j = 0; j < 9; j++) {
        const { subgridIndex, inBoxIndex } = getCellSubgridByCoordinates(i, j);
        const { row, column } = getCellCoordinatesBySubgrid(subgridIndex, inBoxIndex);
        console.assert(row == i && column == j, `(${i}, ${j}) -> (${row}, ${column}) -> (${subgridIndex}, ${inBoxIndex})`);
        console.log("Checked location conversion.");
    }
}

function getCoordinates(cell) {
    const cellId = cell.id;
    const [_, subgridIndex, inBoxIndex] = cellId.split('-');
    const boxY = Math.floor(subgridIndex / 3);
    const boxX = subgridIndex % 3;
    const cellYInBox = Math.floor(inBoxIndex / 3);
    const cellXInBox = inBoxIndex % 3;
    const cellY = boxY * 3 + cellYInBox;
    const cellX = boxX * 3 + cellXInBox;
    return [cellY, cellX];
}

function getCell(cellY, cellX) {
    const subgridIndex = Math.floor(cellY / 3) * 3 + Math.floor(cellX / 3);
    const inBoxIndex = (cellY % 3) * 3 + (cellX % 3);
    return document.getElementById(`cell-${subgridIndex}-${inBoxIndex}`);
}

function getRowByCell(cell) {
    const [cellY, _] = getCoordinates(cell);
    return getRowById(cellY);
}
function getRowById(cellY) {
    const row = [];
    for (let x = 0; x < 9; x++) {
        row.push(getCell(cellY, x));
    }
    return row;
}

function getColumnByCell(cell) {
    const [_, cellX] = getCoordinates(cell);
    return getColumnById(cellX);
}
function getColumnById(cellX) {
    const column = [];
    for (let y = 0; y < 9; y++) {
        column.push(getCell(y, cellX));
    }
    return column;
}

function getBoxByCell(cell) {
    const boxIndex = cell.getAttribute('data-subgrid');
    return getBoxById(boxIndex);
}

function getBoxById(boxIndex) {
    const box = document.querySelectorAll(`.cell[data-subgrid="${boxIndex}"]`);
    return Array.from(box);
}

function printCells(cells) {
    console.log("Printing cells");
    cells.forEach(printCell);
    console.log("-----");
}
function printCell(cell) {
    const [cellY, cellX] = getCoordinates(cell);
    const cellValue = cell.querySelector('.number-content').textContent;
    console.log(`Cell (${cellY}, ${cellX}) has value ${cellValue}`);
}
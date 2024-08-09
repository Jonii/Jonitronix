"use strict";
import { SudokuBoard } from './SudokuBoard.js';

const sudokuboard = new SudokuBoard();
sudokuboard.setBoard(`
  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  _ #3 _| _ 2 1 | _ _ _

  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _

  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  `)



document.addEventListener('keydown', function (e) {
    const inputNum = e.key;
    if (inputNum >= '1' && inputNum <= '9') {
        sudokuboard.enterNumberToSelected(parseInt(inputNum));
        return;
    }
    if (inputNum == 'Backspace') {
        sudokuboard.deleteContentFromSelected();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("board").replaceWith(sudokuboard.htmlParent);

    // Handle number button clicks

    const controlPanel = document.getElementById("controls");
    const buttons = controlPanel.querySelectorAll(".number-container button");
    for (const button of buttons) {
        button.addEventListener("click", () => {
            sudokuboard.enterNumberToSelected(parseInt(button.getAttribute("data-number")));
        })
    }
    const newGameButton = document.getElementById("new-game");
    newGameButton.addEventListener("click", () => {
        sudokuboard.reset();
    })
    
    const checkButton = document.getElementById("check");
    checkButton.addEventListener("click", () => {
        sudokuboard.verify();
    });

    const selectModeBtn = document.getElementById("selectMode");
    console.log(selectModeBtn);
    const toggleSelectMode = () => {
        const oldMode = selectModeBtn.value;
        if (oldMode === "multi" || oldMode === "") {
            selectModeBtn.textContent = "Inputmode: single";
            selectModeBtn.value = "single";
            sudokuboard.selectMode = "single";
            console.log("Setting mode to single");
            return;
        }
        console.log("Setting mode to multi");
        selectModeBtn.textContent = "Inputmode: multi";
        selectModeBtn.value = "multi";
        sudokuboard.selectMode = "multi";

    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Control') {
            toggleSelectMode();
        }
    });

    document.addEventListener('keyup', function (e) {
        if (e.key === 'Control') {
            toggleSelectMode();
        }
    });
    const solveBtn = document.getElementById("solve");
    solveBtn.addEventListener("click", (ev) => {
        let boardArr = new2dBoard();
        
        for (const [val, x, y] of sudokuboard.iterValues()) {
            if (val !== null) {
                boardArr = placeNumber(boardArr, x, y, val);
            }
        }
        const result = iterateSolve(boardArr, []);
        if (result.success) {
            for (const [row, col, num] of result.mvHistory) {
                console.log(`(${row}, ${col}): ${num}`);
                sudokuboard.getCell(row, col).setNumber(num);
            }
        }
        else {
            console.log("Not solvable!!!!");
        }
    });


    selectModeBtn.addEventListener("click", (ev) => {
        toggleSelectMode();
    })
    toggleSelectMode();

});

/**
 * 
 * @param {number} x1 
 * @param {number} y1 
 * @param {number} x2 
 * @param {number} y2 
 * @returns {boolean}
 * 
 * Returns true if the two cells (x1, y1) and (x2, y2) are in the same row, column or sudoku box.
 * False otherwise.
 */
const cellsMustBeDifferent = (x1, y1, x2, y2) => {
    if (x1 === x2 && y1 === y2) {
        return false;
    }
    if (x1 === x2) {
        return true;
    }
    if (y1 === y2) {
        return true;
    }
    const boxX1 = ~~(x1/3);
    const boxX2 = ~~(x2/3);
    const boxY1 = ~~(y1/3);
    const boxY2 = ~~(y2/3);
    if (boxX1 === boxX2 && boxY1 === boxY2) {
        return true;
    }
    return false;
}

/**
 * 
 * @param {Array<Array<Array<number>>>} board 
 * @param {number} row 
 * @param {number} col 
 * @param {number} val
 * @returns {Array<Array<Array<number>>>} 
 */
const placeNumber = (board, row, col, val) => {
    const newBoard = board.map((cellRow, rowIndex) => {
        return cellRow.map((cellVal, colIndex) => {
            if (row === rowIndex && col === colIndex) {
                return val;
            }
            if (!cellsMustBeDifferent(row, col, rowIndex, colIndex)) {
                return cellVal;
            }
            if (typeof cellVal === "number") {
                if (cellVal === val) {
                    return [];
                }
                return cellVal;
            }
            // cellVal is a list
            return cellVal.filter((num) => num !== val);
        });
    })
    return newBoard;
}
const new2dBoard = () => {
    const boardArr = [...Array(9)].map(() => [...Array(9)].map(() => [...Array(9)].map((_, index) => index+1)));
    return boardArr
}

/**
 * 
 * @param {Array<Array<Array<number>>>} board
 * @yields {[cellVal: number|list, rowIndex: number, colIndex: number, boxIndex: number]} 
 */
function* iterateCells(board) {
    for (const [rowIndex, row] of board.entries()) {
        for (const [colIndex, cellVal] of row.entries()) {
            const boxRow = ~~(rowIndex/3);
            const boxColumn = ~~(colIndex/3);
            yield [cellVal, rowIndex, colIndex, (boxRow * 3) + boxColumn];
        }
    }
}
const iterateSolve = (board, mvHistory, calldepth = 1) => {
    console.log(`Call depth: ${calldepth}`);
    let shortestLength = 1000;
    let shortestRow = -1;
    let shortestCol = -1;
    let shortest = null;
    for (const [cellVal, row, col, box] of iterateCells(board)) {
        if (typeof cellVal === "number") {
            continue;
        }
        if (cellVal.length === 0) {
            return {"success": false};
        }
        if (cellVal.length < shortestLength) {
            shortestLength = cellVal.length;
            shortestRow = row;
            shortestCol = col;
            shortest = cellVal;
        }
    }
    if (shortest === null) {
        return {"success": true, "mvHistory": mvHistory}
    }
    for (const num of shortest) {
        console.log(`Row: ${shortestRow}, Col: ${shortestCol}, Val: ${shortest}`);
        const newBoard = placeNumber(board, shortestRow, shortestCol, num);
        const newMvHistory = [...mvHistory, [shortestRow, shortestCol, num]];
        const result = iterateSolve(newBoard, newMvHistory, calldepth + 1);
        if (result.success) {
            return result;
        }
    }
    return {"success": false};
}

const a = new2dBoard();

window.new2dBoard = new2dBoard;
window.placeNumber = placeNumber;
window.trySolve = iterateSolve;
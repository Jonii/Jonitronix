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
 * @typedef {{content: number, possibleValues: Array<number>, other: {}}} SudokuArrayCell
 * @typedef {Array<Array<SudokuArrayCell>>} SudokuArray
 */

/**
 * 
 * @param {SudokuArray} board 
 * @param {number} row 
 * @param {number} col 
 * @param {number} val
 * @returns {SudokuArray} 
 */
export const placeNumber = (board, row, col, val) => {
    if (board[row][col].content !== null) {
        board = deleteEntries(board, {col, row});
    }
    const newBoard = board.map((cellRow, rowIndex) => {
        return cellRow.map((cellVal, colIndex) => {
            if (row === rowIndex && col === colIndex) {
                return {...cellVal, "content": val};
            }
            if (!cellsMustBeDifferent(row, col, rowIndex, colIndex)) {
                return cellVal;
            }
            return {...cellVal, "possibleValues": cellVal.possibleValues.filter((num) => num !== val)};
        });
    })
    return newBoard;
}
/**
 * 
 * @param {SudokuArray} board 
 * @param {number} row 
 * @param {number} col 
 * @returns {SudokuArrayCell}
 */
export const getCell = (board, row, col) => {
    return board[row][col];
}

export const deleteEntries = (board, ...coordinates) => {
    console.log(JSON.stringify(coordinates));
    let newBoard = createBoardArray();
    for (const [cell, row, col, box] of iterateCells(board)) {
        if (coordinates.some(s => s.x === col && s.y === row)) {
            continue;
        }
        if (cell.content === null) {
            continue;
        }
        if ([1, 2, 3, 4, 5, 6, 7, 8, 9].find(s => s === cell.content) === undefined) {
            console.log("Type errors here!");
            continue;
        }
        newBoard = placeNumber(newBoard, row, col, cell.content);
    }
    return newBoard;
}

/**
 * 
 * @returns {SudokuArray}
 */
export const createBoardArray = () => {
    const boardArr = [...Array(9)].map(() => [...Array(9)].map(() => ({
        "content": null, 
        "possibleValues": [...Array(9)].map((_, index) => index+1),
        "other": {}
    })));
    return boardArr
}

/**
 * 
 * @param {SudokuArray} board
 * @yields {[cellVal: SudokuArrayCell, rowIndex: number, colIndex: number, boxIndex: number]} 
 */
export function* iterateCells(board) {
    for (const [rowIndex, row] of board.entries()) {
        for (const [colIndex, cellVal] of row.entries()) {
            const boxRow = ~~(rowIndex/3);
            const boxColumn = ~~(colIndex/3);
            yield [cellVal, rowIndex, colIndex, (boxRow * 3) + boxColumn];
        }
    }
}
export const iterateSolve = (board, mvHistory, calldepth = 1) => {
    console.log(`Call depth: ${calldepth}`);
    let shortestLength = 1000;
    let shortestRow = -1;
    let shortestCol = -1;
    let shortest = null;
    for (const [cellVal, row, col, box] of iterateCells(board)) {
        if (cellVal.possibleValues.length === 0) {
            return {"success": false};
        }
        if (cellVal.content !== null) {
            continue;
        }
        if (cellVal.possibleValues.length < shortestLength) {
            shortestLength = cellVal.possibleValues.length;
            shortestRow = row;
            shortestCol = col;
            shortest = cellVal;
        }
    }
    if (shortest === null) {
        return {"success": true, "mvHistory": mvHistory}
    }
    for (const num of shortest.possibleValues) {
        //console.log(`Row: ${shortestRow}, Col: ${shortestCol}, Val: ${shortest}`);
        const newBoard = placeNumber(board, shortestRow, shortestCol, num);
        const newMvHistory = [...mvHistory, [shortestRow, shortestCol, num]];
        const result = iterateSolve(newBoard, newMvHistory, calldepth + 1);
        if (result.success) {
            return result;
        }
    }
    return {"success": false};
}

export const boardStringToArr = (boardString) => {
    const lines = boardString.split("\n").map((s) => s.trim()).filter((s) => s.length >= 9);
    if (lines.length !== 9) {
        return null;
    }
    let boardArr = createBoardArray();
    for (const [rowInd, line] of lines.entries()) {
        const tokenArr = line.split(/\s*[ \|]\s*/);
        for (const [colInd, token] of tokenArr.entries()) {
            let constant = false;
            let symbol = token;
            if (token.startsWith("#")) {
                constant = true;
                symbol = token.charAt(1);
            }
            if (symbol <= "9" && symbol >= "1") {
                boardArr = placeNumber(boardArr, rowInd, colInd, parseInt(symbol));
                console.log(JSON.stringify(boardArr));
                continue;
            }
            if (symbol === "_") {
                continue;
            }
        }
    }
    return boardArr;
};



export class BoardArr {
    constructor() {
        this.arr = [...Array(9)].map(() => [...Array(9)].map(() => ({
            "content": null, 
            "seenCount": [...Array(9)].map(v => 0),
            "other": {}
        })));
    }
    placeVal(x, y, num) {
        if (this.arr[x][y].content !== null) {
            this.decreaseCounts(x, y, this.arr[x][y].content);
        }
        if ([1, 2, 3, 4, 5, 6, 7, 8, 9].findIndex(num) !== -1) {
            this.increaseCounts(x, y, num);
            this.arr[x][y].content = num;
            return;
        }
        this.arr[x][y].content = null;
    }
    decreaseCounts(x, y, num) {
        for (const [j, row] of this.arr.entries()) {
            for (const [i, cell] of row) {
                if (this.cellsSeeEachOther({x, y}, {"x": i, "y": j})) {
                    cell.seenCount[num] = cell.seenCount[num] - 1;
                }
            }
        }
    }
    increaseCounts(x, y, num) {
        for (const [j, row] of this.arr.entries()) {
            for (const [i, cell] of row) {
                if (this.cellsSeeEachOther({x, y}, {"x": i, "y": j})) {
                    cell.seenCount[num] = cell.seenCount[num] + 1;
                }
            }
        }
    }
    
    cellsSeeEachOther(cell1, cell2) {
        const {x: x1, y: y1} = cell1;
        const {x: x2, y: y2} = cell2;
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

    static fromString(boardstring) {
        const newArr = new BoardArr();
        const lines = boardstring.split("\n").map((s) => s.trim()).filter((s) => s.length >= 9);
        if (lines.length !== 9) {
            return newArr;
        }
        for (const [rowInd, line] of lines.entries()) {
            const tokenArr = line.split(/\s*[ \|]\s*/);
            for (const [colInd, token] of tokenArr.entries()) {
                let constant = false;
                let symbol = token;
                if (token.startsWith("#")) {
                    constant = true;
                    symbol = token.charAt(1);
                }
                if (symbol <= "9" && symbol >= "1") {
                    newArr.placeVal(colInd, rowInd, parseInt(symbol));
                    continue;
                }
                if (symbol === "_") {
                    continue;
                }
            }
        }
 
    }


}
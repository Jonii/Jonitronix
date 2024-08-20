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
    for (const [cell, row, col] of iterateCells(board)) {
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
        "other": {immutable: false}
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
export const iterateSolve = async (board, mvHistory, progressElement = undefined, start=0, end=0, maxSolutions=1000) => {
    let shortestLength = 1000;
    let shortestRow = -1;
    let shortestCol = -1;
    let shortest = null;
    for (const [cellVal, row, col] of iterateCells(board)) {
        if (cellVal.possibleValues.length === 0) {
            return {"success": false, "solutions": 0};
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
        return {"success": true, "mvHistory": mvHistory, solutions: 1}
    }
    let returnedResult = {"success": false, "solutions": 0}
    console.log(`maxSolutions: ${maxSolutions}`);
    for (const [i, num] of shortest.possibleValues.entries()) {
        //console.log(`Row: ${shortestRow}, Col: ${shortestCol}, Val: ${shortest}`);
        const newBoard = placeNumber(board, shortestRow, shortestCol, num);
        const newMvHistory = [...mvHistory, [shortestRow, shortestCol, num]];
        const stepSize = (end-start) / shortest.possibleValues.length;
        const currentProgress = start + (stepSize * i);
        const result = await iterateSolve(newBoard, newMvHistory, progressElement, start=currentProgress, end=currentProgress + stepSize, maxSolutions=maxSolutions-returnedResult.solutions);
        if (stepSize > 0.5) {
            console.log(`updating progress element to ${currentProgress + stepSize}(stepsize: ${stepSize})`);
            progressElement.value = currentProgress + stepSize;
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        if (result.success) {
            result.solutions = returnedResult.solutions + result.solutions;
            returnedResult.solutions = result.solutions;
        }
        if (!returnedResult.success) {
            returnedResult = result;
        }
        if (returnedResult.solutions >= maxSolutions) {
            return returnedResult;
        }
    }
    return returnedResult;
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



export class BoardArray {
    constructor() {
        this.arr = [...Array(9)].map(() => [...Array(9)].map(() => ({
            "content": null, 
            "seenCount": [...Array(10)].map(() => 0),
            "other": {}
        })));
    }
    placeVal(x, y, num, kwargs) {
        console.log(`Placing val ${num} to ${x}, ${y}`);
        if (this.getCell(x, y).content !== null) {
            this.decreaseCounts(x, y, this.getCell(x, y).content);
        }
        if ([1, 2, 3, 4, 5, 6, 7, 8, 9].findIndex(v => v === num) !== -1) {
            this.increaseCounts(x, y, num);
            this.getCell(x, y).content = num;
            if (kwargs?.immutable) {
                this.getCell(x, y).other.immutable = true;
            }
            return;
        }
        this.getCell(x, y).content = null;
    }
    decreaseCounts(x, y, num) {  
        for (const [cell, y0, x0] of this.iterateCells()) {
            if (this.cellsSeeEachOther({x, y}, {"x": x0, "y": y0})) {
                cell.seenCount[num] = cell.seenCount[num] - 1;
            }
        }
    }
    increaseCounts(x, y, num) {
        for (const [cell, y0, x0] of this.iterateCells()) {
            if (this.cellsSeeEachOther({x, y}, {"x": x0, "y": y0})) {
                cell.seenCount[num] = cell.seenCount[num] + 1;
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

    getCell(x, y) {
        return this.arr[y][x];
    }

    *iterateCells() {
        for (const [y, row] of this.arr.entries()) {
            for (const [x, cell] of row.entries()) {
                const boxRow = ~~(y/3);
                const boxCol = ~~(x/3);
                yield [cell, y, x, boxRow * 3 + boxCol];
            }
        }
    }

    static fromString(boardstring) {
        const newArr = new BoardArray();
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
                    newArr.placeVal(colInd, rowInd, parseInt(symbol), {immutable: constant});
                    continue;
                }
                if (symbol === "_") {
                    continue;
                }
            }
        }
        return newArr;
    }


}
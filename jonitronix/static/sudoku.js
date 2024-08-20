"use strict";
import { BoardElement } from './BoardElement.js';
import { SudokuBoard } from './SudokuBoard.js';
import { createBoardArray, iterateSolve, placeNumber, BoardArray } from './sudokuarr.js';

const sudokuboard = new SudokuBoard();
const board1 = `
  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  _ #3 _| _ 2 1 | _ _ _

  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _

  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  `;

const board2 = `
  _  _  _|  _  _  _ |  _  _  _
  _  _  _|  _  _  _ |  _  _  _
  _  _ #4|  _  _  _ |  _  _  _

  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ #3 2 | _ _ _
  _ _ _ | _ #8 #9 | _ _ _

  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  _ _ _ | _ _ _ | _ _ _
  `;
sudokuboard.setBoard(board1)



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
    const puzzleSelectModal = document.getElementById("puzzle-select");
    newGameButton.addEventListener("click", () => {
        puzzleSelectModal.classList.add("active");
        const puzzleSelection = document.getElementById("puzzle-select-content");
        puzzleSelection.replaceChildren();
        const puzzleStrings = [board1, board2];
        for (const s of puzzleStrings) {
            const puzzlePreview1 = new BoardElement();
            const arr = BoardArray.fromString(s);
            for (const [cell, y, x, boxnum] of arr.iterateCells()) {
                puzzlePreview1.setCellVal(x, y, cell.content);
            }
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "radio";
            checkbox.name = `puzzle-select-group`;
            checkbox.value = s;
            checkbox.hidden = true;
            label.appendChild(checkbox);
            label.appendChild(puzzlePreview1);
            puzzleSelection.appendChild(label);
        }
    })
    const closePuzzleSelectModalBtn = document.getElementById("close-puzzle-select");
    closePuzzleSelectModalBtn.addEventListener("click", () => {
        puzzleSelectModal.classList.remove("active");
    });
    const loadPuzzleBtn = document.getElementById("select-load");
    loadPuzzleBtn.addEventListener("click", () => {
        const puzzleChoices = document.getElementsByName("puzzle-select-group");
        for (const puzzleChoice of puzzleChoices) {
            if (puzzleChoice.checked) {
                sudokuboard.reset();
                sudokuboard.setBoard(puzzleChoice.value);
                puzzleSelectModal.classList.remove("active");
                break;
            }
        }
    })
    
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
    solveBtn.addEventListener("click", async (ev) => {
        const resultCount = document.getElementById("solve-count");
        resultCount.textContent = "";
        
        const maxSolutions = 100;

        await new Promise(resolve => setTimeout(resolve, 10));
        let boardArr = createBoardArray();
        
        for (const [val, x, y] of sudokuboard.iterValues()) {
            if (val !== null) {
                boardArr = placeNumber(boardArr, x, y, val);
            }
        }
        const result = await iterateSolve(boardArr, [], document.getElementById("solve-progress"), 0, 100, maxSolutions);
        if (result.success) {
            for (const [x, y, num] of result.mvHistory) {
                sudokuboard.enterNumber(x, y, num);
            }
        }
        else {
            console.log("Not solvable!!!!");
        }
        resultCount.textContent = `Total solutions: ${result.solutions}${result.solutions === maxSolutions ? "+" : ""}`;
    });



    selectModeBtn.addEventListener("click", (ev) => {
        toggleSelectMode();
    })
    toggleSelectMode();

});

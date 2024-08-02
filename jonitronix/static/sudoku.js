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
    if (e.key === 'Control') {
        sudokuboard.selectMode = "multi";
    }
});

document.addEventListener('keyup', function (e) {
    if (e.key === 'Control') {
      sudokuboard.selectMode = "single";
    }
});

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
        sudokuboard.enterNumberToSelected(button.getAttribute("data-number"));
      })
    }
    const newGameButton = document.getElementById("new-game");
    newGameButton.addEventListener("click", () => {
      sudokuboard.reset();
    })


});
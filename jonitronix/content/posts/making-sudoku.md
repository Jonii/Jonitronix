+++
title = 'Making a sudoku'
date = 2024-08-20T14:06:48+02:00
+++
[Sudoku](/sudoku.html)
# The path

Crafting a sudoku app was a rather fun experiment in UI/UX design, and I wanted to write shortly about interesting challenges there.

## Basic tooling

First things first, I decided early on to try to stay minimalistic with dependencies. Since this is one of the first web apps I've created, I decided I would try to feel the pain first before resorting to tools that would alleviate the pain. In the case of simple sudoku app, turns out that it doesn't seem to be quite complicated enough to warrant complicated tooling, and as such, I ended up not leaving basic HTML/CSS/JS.

One thing I enjoy is having type safety. Typescript is often used for this purpose, but as it turns out, JSDoc actually allows one to write plain Javascript while still getting to benefit from linting, type checking, and sensible autocompletion, and as VSCode, my editor of choice, supports this out of the box, I ended up not needing further tooling.

This app also wouldn't really need any serverside functionality beside serving static files, so overall, basic architecture ended up being perhaps a bit boring, but boring is often good if you want to make something that works. Simple `python -m http.server` would be all that's needed to get server up and running, in a folder with the static files.

## Web components?

My first big question with this project was "where would the data live?". The simplest solution is often a good starting point, so I decided to use DOM as my data model. Each HTML cell element had its status be the single source of truth about the state of the sudoku puzzle. This worked quite well early on, and it prompted me to try out web components to allow me to use more well-structured approach to handling state changes of these cells.

Web components, the best I can tell, are just classes that extend HTML elements. They're controversial, and one of the big reasons for it seems to be that web components seem to go hand-in-hand with using so-called "Shadow DOM", a place where styling for this component lives. This allows further encapsulate the element, so global CSS wouldn't interact with it. The downside of this however is, that, well, global CSS won't interact with the element, leaving it unclear how to best style web components.

As such, I opted to use web components merely as namespaces, allowing me to collect methods for handling the game logic relating to the individual cells, under this namespace, but keep doing global styles. This means, no shadow DOM for me, I kept using the regular, "light" DOM.

An example of this would be a simple "set the number shown on the cell" operation. Also, setting the status of the cells, like "This cell has illegal value, it sees another of the same value", would be handled by this component.

The board itself I would create as a web component. The board handled logic relating to selecting elements, and entering numbers to selections, allowing the control panel to just have very short event listeners, merely calling the board interface, which would then independently call the cells to do its bidding.

## A tale of over-abstraction

Handling detection of illegal states was somewhat problematic. At first, I implemented callbacks for cells, so they could observe other cells they see, and update their status if the cell they see had illegal status. This approach seemed to work, but ultimately, it ended up feeling like a massive overkill. It seemed like one could do much better. So I decided to scrap everything and try a different approach, doing this logic on the board-scale, and updating the HTML elements based on this board-level logic.

This however meant that the individual cells were now sort of "anemic" abstractions, and so, the `SudokuCell.js` could be removed. Board itself could create simple divs containing the numbers, and manage updating each cell, it wasn't worth the indirection to have separate class tasked with such a simple task.

## Performance of the DOM as data model

When implementing the sudoku solver, I had to start considering how efficient the DOM was as a data model. Turns out, updating DOM, even without redraws, was about 30x slower than manipulating elements such as arrays. I tested this by running simple for loop, updating values on an array on one hand, and updating data value of an HTML element on the other. After both, the same HTML element would be updated to the same value. Timing this, HTML element manipulations seemed to cost about 30x more, even though the end result was the same. While in normal use this wouldn't be such a problem, a feature I wanted to implement was an automatic sudoku solver, which could be somewhat computationally heavy. So this prompted me to create tools to handle non-DOM tooling for checking state of sudoku.

This then made me ponder again the question of, where should the data live? Since the solver ended up requiring the separate data-only logic, how much would it take to make that the data model, rather than DOM? I decided to find out, and ended up creating simple `BoardArray` class, as well as `BoardElement` web component which had no Sudoku logic attached, it could simply be used to place numbers, delete them, and change status of individual cells.

These two would then be combined in the `SudokuBoard` class, which would have the game logic, and it would have a simple `render()` method, to update the status of the `BoardElement` to match that of its single source of truth, `BoardArray`. This workflow was quite easy. After making changes, like placing or deleting numbers, you would render the entire board, which is, add and remove numbers as per BoardArray, and add the classes like `illegal` , `selected` or `affected`(to signify the cell value is the same as some other cell it sees, to signify that the cell has been selected, and to signify that selected cells all see this cell).

## Solving solver problems

Solver was a fun algorithmic challenge I wanted to highlight. At first, my approach was for `SudokuCell` to keep track of, and observe, other cells it sees, and then notify its own changes to others. This demanded that each cell kept a list of all the observers that wanted to know when its own state changed, and keep a list of all the cells it saw, and various combinations of events were quite error-prone. For example, if you knew that you were in illegal state because you had number 4, and someone notified you that they also have number 4, you were now in illegal state. But what happens if you now have user update your value to 5? You need to keep list of all the values you're seeing at the moment, and overall, this seemed like not really a good solution.

My second attempt was very simplistic, using `SudokuArray`. Each cell had value(or null), and a list of possible values. Each time a number got added, you would remove this number as a possibility from all the other cells that saw this cell, in a simple for loop, of type

```
targetCell.value = 1;
for cell of cells:
   if targetCell sees cell:
      cell.possibleValues = cell.possibleValues.filter(c => c != 1)
```

This worked fine for a solver, but turns out, this was not workable for using it as a data model for the normal game. The reason was somewhat surprising to me at the time: You can't handle deletion of numbers too well. If a cell with "5" as value gets its value deleted(or changed), you cannot go and add this 5 to each number it sees, because those cells might see another 5.

The solution to this ended up being really simple: Just keep track of how many occurences of each number the cell sees. So a simple seenCount array, with 9 values. So if you change value of cell from 4 to 6, you'd deduct from the count of 4's seen 1, and add 1 to count of 6's seen, for all cells this cell sees. The logic of `possibleValues.contains(6)` ends up mapping to simple `seenCount[6] == 0`.

## Lessons learned

One of the primary lessons I learned here was the importance of keeping with conventions. In particular, I ended up using `x, y` names for coordinates at times, and `row, column` at others, and this ended up causing plenty of rather unnecessary debugging. If I could go back in time, I think I would mainly advocate for picking a convention, and sticking with it.

Another lesson I learned was that I was perhaps too eager to go for abstractions like `SudokuCell`. This however might be a case of hindsight being 20/20, I ended up reusing pretty much all of the sudokucell code, and even the complex callback/observer mess ended up being mostly salvaged in a simpler form later. But regardless, I think the pattern of simple data structure backed by `render()` method seems quite handy and powerful.
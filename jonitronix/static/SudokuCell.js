

export class SudokuCell extends HTMLElement {

    constructor(column, row) {
        super();
        this.modifiable = true;
        this.selected = false;
        this.illegal = false;
        this.innerHTML = `
            <div class="cell-border">
                <div class="number-content"></div>
            </div>
        `;

        this.relations = [];
        this.observers = [];
        this.violations = [];
        this.row = row;
        this.column = column;
        const boxRow = (~~(row/3));
        const boxCol = (~~(column/3));
        this.rowId = `row-${row}`;
        this.colId = `column-${column}`;
        this.boxId = `box-${boxRow}-${boxCol}`;
        this.classList.add("cell", "modifiable", this.rowId, this.colId, this.boxId);
        const boxBorderToTheTop = (boxRow*3) === row && row>0;
        const boxBorderToTheLeft = (boxCol*3) === column && column>0;
        if (boxBorderToTheLeft) {
            this.classList.add("box-border-left");
        }
        if (boxBorderToTheTop) {
            this.classList.add("box-border-top");
        }
    }
    /**
     * 
     * @param {SudokuCell} cell 
     * @param {(a: number|null, b: number|null) => boolean} rel 
     * Takes a cell which we depend on, and a relation.
     * 
     * Relation is a function that takes two numbers, and returns true if values are not contradictory,
     * and false if the values are violating the contract.
     */
    addRelation(cell, rel) {
        console.log("Added relation to cell");
        const index = this.relations.length;
        this.relations.push({cell, rel});
        cell.registerObserver((newVal) => {
            if (rel(this.number, newVal)) {
                this.violations = this.violations.filter(v => v !== index);
            }
            else {
                this.violations.push(index);
            }
            if (this.violations.length > 0) {
                this.illegal = true;
            }
            else {
                this.illegal = false;
            }
        });
    }
    checkRelations() {
        this.violations = [];
        for (const [index, {cell, rel}] of this.relations.entries()) {
            if (rel(this.number, cell.number)) {
                continue;
            }
            this.violations.push(index); 
        }
        return this.violations.length === 0;
    }
    registerObserver(fn) {
        this.observers.push(fn);
    }

    connectedCallback() {
    }

    /**
     * 
     * @param {number} num 
     * @returns {"entered"|"alreadyPresent"|"unmodifiable"|"notInRange"}
     */
    setNumber(num) {
        if (!this.modifiable) {
            return "unmodifiable";
        }
        if (this.number === num) {
            return "alreadyPresent";
        }
        if (num < 1 || num > 9 || num%1 !== 0) {
            return "notInRange";
        }
        this.number = num;
        if (!this.checkRelations()) {
            this.illegal = true;
        }
        else {
            this.illegal = false;
        }
        for (const callback of this.observers) {
            callback(num);
        };
    }

    /**
     * 
     * @returns {"unmodifiable"|"alreadyEmpty"|"deleted"}
     */
    delNumber() {
        if (!this.modifiable) {
            return "unmodifiable";
        }
        if (this.number === "") {
            return "alreadyEmpty";
        }
        this.number = null;
        for (const callback of this.observers) {
            callback(null);
        }
        return "deleted";
    }
    /**
     * @returns {number|null}
     */
    get number() {
        const val = this.querySelector(".number-content").textContent;
        if (val === "") {
            return null;
        }
        return Number(val);
    }
    /**
     * @param {number|null} num 
     */
    set number(num) {
        if (num === null) {
            this.querySelector(".number-content").textContent = "";
            return;
        }
        this.querySelector(".number-content").textContent = num;
    }
    /**
     * @returns {boolean}
     */
    get modifiable() {
        return this.classList.contains("modifiable")
    }
    /**
     * @param {boolean|undefined} m 
     */
    set modifiable(m) {
        if (m === true) {
            this.classList.add("modifiable");
            this.classList.remove("unmodifiable");
        }
        if (m === false) {
            this.classList.add("unmodifiable");
            this.classList.remove("modifiable");
        }
    }

    get selected() {
        return this.classList.contains("selected");
    }
    /**
     * @param {boolean|undefined} s
     */
    set selected(s) {
        if (s === true) {
            this.classList.add("selected");
        }
        if (s === false) {
            this.classList.remove("selected");
        }
    }

    /**
     * @returns {boolean}
     */
    get affected() {
        return this.classList.contains("affected");
    }
    /**
     * @param {boolean} a 
     */
    set affected(a) {
        if (a === true) {
            this.classList.add("affected");
        }
        if (a === false) {
            this.classList.remove("affected");
        }
    }
 
    /**
     * @returns {boolean}
     */
    get illegal() {
        return this.classList.contains("illegal");
    }
    /**
     * @param {boolean} a 
     */
    set illegal(a) {
        if (a === true) {
            this.classList.add("illegal");
        }
        if (a === false) {
            this.classList.remove("illegal");
        }
    }   
}

customElements.define("sudoku-cell", SudokuCell);
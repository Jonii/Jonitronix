

export class SudokuCell extends HTMLElement {

    constructor() {
        super();
        this.modifiable = true;
        this.selected = false;
        this.illegal = false;
        this.innerHTML = `
            <div class="cell-border">
                <div class="number-content"></div>
            </div>
        `;
        this.classList.add("cell", "modifiable");
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
}

customElements.define("sudoku-cell", SudokuCell);
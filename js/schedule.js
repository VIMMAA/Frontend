let tempRows = document.querySelectorAll("tr");
let rows = Array.from(tempRows).slice(1);

let tempCells = document.querySelectorAll("td");
let cells = Array.from(tempCells);

cells = Array.from(tempCells).filter((_, index) => (index) % 7 !== 0)

console.log(rows, cells);

let firstCell = null;
let lastCell = null;
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.textContent.length > 0) {
            if (firstCell == null) {
                cell.classList.toggle("selected");
                firstCell = cell;
            } else if (firstCell == cell) {
                cell.classList.toggle("selected");
                firstCell = null;
            }
        }
    })
});
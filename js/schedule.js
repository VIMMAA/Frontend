let tempCells = document.querySelectorAll("td");
let cells = Array.from(tempCells);

cells = Array.from(tempCells).filter((_, index) => (index) % 7 !== 0)

cells.forEach(cell => {
    cell.addEventListener('click', () => {
        if (cell.textContent.length > 0)
                cell.classList.toggle("selected");
        else if (cell.classList.contains('selected')) {
                cell.classList.toggle("selected");
        }
    })
});

function highlightCells(firstCell, lastCell) {
    const firstIndex = Array.from(firstCell.parentElement.children).indexOf(firstCell);
    const lastIndex = Array.from(lastCell.parentElement.children).indexOf(lastCell);

    document.querySelectorAll('.selected').forEach(cell => {
        cell.classList.remove('selected');
    });

    const start = Math.min(firstIndex, lastIndex);
    const end = Math.max(firstIndex, lastIndex);

    rows.forEach(row => {
        for (let i = start; i <= end; i++) {
            if (row.children[i].textContent.length > 0)
                row.children[i].classList.add("selected");
        }
    });
}
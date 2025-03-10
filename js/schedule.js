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

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'txt', 'pdf', 'doc', 'docx'];

    fileInput.addEventListener('change', () => {
        const files = fileInput.files;

        if (files.length === 0) return;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileExtension = file.name.split('.').pop().toLowerCase();

            if (!allowedExtensions.includes(fileExtension)) {
                alert(`Файл "${file.name}" имеет недопустимый формат!`);
                continue;
            }

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center bg-secondary text-white';
            li.innerHTML = `
                <span>${file.name}</span>
                <button class="btn btn-danger btn-sm delete-file">Удалить</button>
            `;
            fileList.appendChild(li);
        }

        fileInput.value = '';
    });

    fileList.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-file')) {
            const li = event.target.closest('li');
            fileList.removeChild(li);
        }
    });
});

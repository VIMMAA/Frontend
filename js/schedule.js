
//необходимо грамотно для расписания переменные подсчитать потом
//нужно помимо таблиц еще вывод дней недели поменять
let scheduleStatement = document.querySelectorAll('table');
console.log(scheduleStatement);

let changeStatement = document.querySelector('#statement');
console.log(changeStatement);

let tempCells = document.querySelectorAll("td");
    let cells = Array.from(tempCells);
    
    cells = scheduleStatement[0].classList.contains('d-none') ? Array.from(tempCells).filter((_, index) => (index) % 7 !== 0) : Array.from(tempCells);
    
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (cell.textContent.length > 0)
                    cell.classList.toggle("selected");
            else if (cell.classList.contains('selected')) {
                    cell.classList.toggle("selected");
            }
        })
    });

changeStatement.addEventListener('click', () => {
    scheduleStatement.forEach(statement => {
        if (!statement.classList.contains('d-none')) {
            statement.classList.toggle('d-none');
        } else {
            statement.classList.toggle('d-none');
        }
        
    })

    let tempCells = document.querySelectorAll("td");
    let cells = Array.from(tempCells);
    
    cells = scheduleStatement[0].classList.contains('d-none') ? Array.from(tempCells).filter((_, index) => (index) % 7 !== 0) : Array.from(tempCells);
    
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            if (cell.textContent.length > 0)
                    cell.classList.toggle("selected");
            else if (cell.classList.contains('selected')) {
                    cell.classList.toggle("selected");
            }
        })
    });
});

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

function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const calendarBody = document.getElementById('calendarBody');
    calendarBody.innerHTML = '';

    let date = 1;
    for (let i = 0; i < 6; i++) { 
        let row = document.createElement('tr');
        
        for (let j = 0; j < 7; j++) {
            let cell = document.createElement('td');
            
            if (i === 0 && j < (firstDay === 0 ? 6 : firstDay - 1)) {
                cell.innerHTML = '';
            } else if (date > daysInMonth) {
                cell.innerHTML = '';
            } else {
                cell.innerHTML = date;
                date++;
            }
            
            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
        
        if (date > daysInMonth) {
            break;
        }
    }
}   

generateCalendar(2025, 1);
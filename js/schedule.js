let month = new Date().getMonth();
let year = new Date().getFullYear();
let selectedClasses = [];
let flagDay = new Date();
launchStatic();
eventClickers(month);
generateCalendar(year, month);
updateCells();

function eventClickers(month) {
    let changeStatement = document.querySelector('#statement');
    let dateStatement = document.querySelector("#dateStatement");
    let scheduleStatement = document.querySelectorAll('table');
    
    let next = document.querySelector("#next");
    let previous = document.querySelector("#previous");
    
    changeStatement.addEventListener('click', () => {
        scheduleStatement.forEach(statement => {
            if (!statement.classList.contains('d-none') && statement.id === "classesTable") {
                statement.classList.toggle('d-none');
                next.innerHTML = "Следующий месяц &rarr;";
                previous.innerHTML = "&larr; Предыдущий месяц"; 
                dateStatement.textContent = `${month + 1} месяц`;
                changeStatement.textContent = "Открыть расписание";
            } else {
                statement.classList.toggle('d-none');
                next.innerHTML = "Следующая неделя &rarr;";
                previous.innerHTML = "&larr; Предыдущая неделя";
                dateStatement.textContent = `03.03.2025 - 08.03.2025`;//пофиксить так чтоб актуальная дата была
                changeStatement.textContent = "Открыть календарь";
            }
        });
    
        updateCells();
    });
    
    next.addEventListener("click", () => {
        if (changeStatement.textContent == "Открыть расписание") {
            month = (month + 1) % 12;
            dateStatement.textContent = `${month + 1} месяц`;
            generateCalendar(2025, month);
            updateCells();
        }
    });
    
    previous.addEventListener("click", () => {
        if (changeStatement.textContent == "Открыть расписание") {
            month = (month - 1 + 12) % 12;
            dateStatement.textContent = `${month + 1} месяц`;
            generateCalendar(2025, month);   
            updateCells();
        }
    });

    next.addEventListener("click", () => {
        if (changeStatement.textContent == "Открыть календарь") {
            launchStatic(1);
            updateCells();
        }
    });
    
    previous.addEventListener("click", () => {
        if (changeStatement.textContent == "Открыть календарь") {
            launchStatic(-1);
            updateCells();
        }
    });
}

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
            let cellId = `${year}-${month + 1}-${date}`; 

            if (i === 0 && j < (firstDay === 0 ? 6 : firstDay - 1)) {
                cell.innerHTML = '';
            } else if (date > daysInMonth) {
                cell.innerHTML = '';
            } else {
                cell.innerHTML = date;
                date++;
            }

            cell.setAttribute('data-id', cellId);
            cell.addEventListener('click', handleClassClick);

            if (selectedClasses.includes(cellId)) {
                cell.classList.add('selected');
            }


            row.appendChild(cell);
        }
        
        calendarBody.appendChild(row);
        
        if (date > daysInMonth) {
            break;
        }
    }
}

function handleClassClick(event) {
    const cell = event.target;
    
    if (cell.textContent.length > 0) {
        const cellId = cell.getAttribute('data-id'); // Используем data-id

        cell.classList.toggle("selected");

        if (cell.classList.contains("selected")) {
            if (!selectedClasses.includes(cellId)) {
                selectedClasses.push(cellId); // Добавляем ID пары в массив
            }
        } else {
            selectedClasses = selectedClasses.filter(id => id !== cellId); // Удаляем ID пары из массива
        }

        console.log(selectedClasses); // Логируем массив выбранных ID
    }
}

function updateCells() {
    let tempCells = document.querySelectorAll("td");
    const scheduleStatement = document.querySelectorAll('table');
    let cells = Array.from(tempCells);

    cells = scheduleStatement[1].classList.contains('d-none') ? Array.from(tempCells).filter((_, index) => (index) % 7 !== 0) : Array.from(tempCells);

    cells.forEach(cell => {
        cell.removeEventListener('click', handleClassClick); 
        cell.addEventListener('click', handleClassClick);  

        
        const cellId = cell.getAttribute('data-id');
        if (selectedClasses.includes(cellId)) {
            cell.classList.add("selected");
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');

    const allowedExtensions = ['jpg', 'jpeg', 'png'];

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

//часть кода где будут запросы к бэку

function getWeekRange(date) {
    const currentDate = new Date(date);
    const dayOfWeek = currentDate.getDay();
    const diffToStartOfWeek = currentDate.getDate() - dayOfWeek + 1;
    const startOfWeek = new Date(currentDate.setDate(diffToStartOfWeek));
    const endOfWeek = new Date(currentDate.setDate(diffToStartOfWeek + 6));

    const startOfWeekISO = startOfWeek.toISOString();
    const endOfWeekISO = endOfWeek.toISOString();

    return { startOfWeekISO, endOfWeekISO, startOfWeek, endOfWeek };
}

function getDatesForWeek(startDate) {
    const weekDates = [];
    let currentDay = new Date(startDate);

    for (let i = 0; i < 7; i++) {
        let date = new Date(currentDay);
        date.setDate(currentDay.getDate() + i);
        weekDates.push(date);
    }

    return weekDates;
}

async function launchStatic(diff = 0) { 
    // Убираем очистку selectedClasses
    // selectedClasses = [];

    flagDay.setDate(flagDay.getDate() + diff * 7);
    console.log(flagDay);
    const weekRange = getWeekRange(flagDay);
    const weekDates = getDatesForWeek(weekRange.startOfWeek);

    document.getElementById('dateStatement').innerHTML = `${weekRange.startOfWeekISO.slice(0, 10)} по ${weekRange.endOfWeekISO.slice(0, 10)}`;
    
    const dayNames = document.querySelectorAll('.classes-list tr th');
    const headers = Array.from(dayNames);

    for (let i = 0; i < 7; i++) {
        const formattedDate = weekDates[i].toLocaleDateString('ru-RU', {
            month: 'long',
            day: 'numeric'
        });

        headers[i + 1].innerHTML = `${headers[i + 1].innerHTML.split('<br>')[0]}<br>${formattedDate}`;
    }
    console.log(weekDates);//беру
    console.log(weekRange);

    await setTimeInCells(weekDates);

    loadClasses(weekRange.startOfWeekISO, weekRange.endOfWeekISO);
}

function setTimeInCells(weekDates) {
    const rows = document.querySelectorAll("#classesTable tbody tr"); // Все строки таблицы
    const timeStarters = [
        "08:45:00Z",
        "10:35:00Z",
        "12:25:00Z",
        "14:45:00Z",
        "16:35:00Z",
        "18:25:00Z",
        "20:15:00Z",
    ];

    // Очищаем предыдущие данные и выделение
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        cells.forEach(cell => {
            cell.removeAttribute('data-time');
            cell.textContent = '';
            cell.classList.remove('selected'); // Снимаем выделение
        });
    });

    // Заполняем ячейки
    rows.forEach((row, rowIndex) => {
        if (rowIndex >= timeStarters.length) return; // Проверяем, чтобы не выйти за пределы временных слотов

        const cells = row.querySelectorAll("td");
        cells.forEach((cell, cellIndex) => {
            if (cellIndex === 0) return; // Пропускаем первый столбец (время)

            const dayIndex = cellIndex - 1; // Индекс дня недели (0-6)
            const currentDate = new Date(weekDates[dayIndex]); // Дата для текущего дня

            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const day = String(currentDate.getDate()).padStart(2, '0');

            const timeStarter = timeStarters[rowIndex]; // Временной слот
            const isoDate = `${year}-${month}-${day}T${timeStarter}`;

            cell.setAttribute('data-time', isoDate); // Устанавливаем data-time
        });
    });
}
function loadClasses(dateFrom, dateTo) {
    const token = localStorage.getItem('jwtToken');

    fetch(`https://okr.yzserver.ru/api/Schedule?DateFrom=${dateFrom}&DateTo=${dateTo}`, {
        method: 'GET',
        headers: {
            accept: '*/*',
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => {
        if (response.ok) {
            console.log("Запрос на расписание прошел успешно.");
            return response.json();
        } else {
            console.warn(`Ошибка при получении данных: ${response.status}`);
        }
    })
    .then(data => {
        console.log("Данные получены:");
        let arrayCells = document.querySelectorAll("td");
        let emptyCells = Array.from(arrayCells).filter(cell => cell.textContent.trim() === "");

        data.forEach(day => {
            let dayClass = {
                endTime: day.endTime,
                id: day.id,
                name: day.name,
                startTime: day.startTime
            };
            console.log(dayClass);

            // Находим ячейку с соответствующим data-time
            emptyCells.forEach(cell => {
                if (cell.getAttribute('data-time') === dayClass.startTime) {
                    cell.setAttribute('data-id', dayClass.id); // Устанавливаем data-id
                    cell.textContent = dayClass.name;

                    // Проверяем, нужно ли выделить ячейку
                    if (selectedClasses.includes(dayClass.id)) {
                        cell.classList.add('selected');
                    }
                }
            });
        });
    })
    .catch(error => {
        console.error("Ошибка при запросе:", error);
    });
}
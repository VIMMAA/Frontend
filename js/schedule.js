let month = new Date().getMonth();
let year = new Date().getFullYear();
let selectedClasses = [];
let flagDay = new Date();
launchStatic();
eventClickers(month);
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

let applicationData = { files: [] }; // Глобальная переменная

document.addEventListener('DOMContentLoaded', () => {
    const submitApplicationButton = document.getElementById('submitApplication');
    if (submitApplicationButton) {
        submitApplicationButton.addEventListener('click', async () => {
            // Блокируем кнопку
            submitApplicationButton.disabled = true;
            submitApplicationButton.textContent = 'Отправка...';

            const files = document.getElementById('fileInput').files;

            if (files.length === 0) {
                alert('Пожалуйста, загрузите хотя бы один файл.');
                submitApplicationButton.disabled = false; // Разблокируем кнопку
                submitApplicationButton.textContent = 'Отправить заявку';
                return;
            }

            const applicationData = {
                lessons: selectedClasses,
                files: []
            };

            console.log('Начало обработки файлов...');
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                console.log(`Обработка файла: ${file.name}`);
                try {
                    const base64Data = await fileToBase64(file);
                    console.log(`Файл "${file.name}" успешно преобразован в base64.`);
                    applicationData.files.push({
                        name: file.name,
                        data: base64Data
                    });
                } catch (error) {
                    console.error(`Ошибка при чтении файла "${file.name}":`, error);
                    alert(`Ошибка при чтении файла ${file.name}.`);
                    submitApplicationButton.disabled = false; // Разблокируем кнопку
                    submitApplicationButton.textContent = 'Отправить заявку';
                    return;
                }
            }

            console.log('Данные заявки:', applicationData);
            if (applicationData.files.length === 0) {
                console.error('Файлы не были добавлены в applicationData.files.');
                alert('Ошибка: файлы не были обработаны.');
                submitApplicationButton.disabled = false; // Разблокируем кнопку
                submitApplicationButton.textContent = 'Отправить заявку';
                return;
            }

            // Отправка заявки
            try {
                const response = await submitApplication(applicationData);
                if (response.ok) {
                    console.log('Заявка успешно отправлена.');
                    alert('Заявка успешно отправлена!');
                    // Перенаправляем пользователя на страницу заявок
                    window.location.href = 'applicationsList.html'; // Замените на нужный URL
                } else {
                    const errorData = await response.json();
                    console.error('Ошибка при отправке заявки:', errorData);
                    alert(`Ошибка при отправке заявки: ${errorData.message || 'Неизвестная ошибка'}`);
                }
            } catch (error) {
                console.error('Ошибка при отправке заявки:', error);
                alert('Ошибка при отправке заявки.');
            } finally {
                // Разблокируем кнопку после завершения запроса
                submitApplicationButton.disabled = false;
                submitApplicationButton.textContent = 'Отправить заявку';
            }
        });
    }
});
async function submitApplication(data) {
    const token = localStorage.getItem('jwtToken');

    console.log('Отправка данных на сервер...');
    console.log('Данные:', data);

    return fetch('https://okr.yzserver.ru/api/Application', {
        method: 'POST',
        headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data)
    });
}


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

//отправка файлов

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            console.log(`Файл "${file.name}" успешно прочитан.`);
            const base64String = reader.result.split(',')[1]; // Убираем префикс "data:image/png;base64,"
            resolve(base64String);
        };
        reader.onerror = (error) => {
            console.error(`Ошибка при чтении файла "${file.name}":`, error);
            reject(error);
        };
    });
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Очищаем список перед обновлением

    applicationData.files.forEach((file, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center bg-secondary text-white';
        li.innerHTML = `
            <span>${file.name}</span>
            <button class="btn btn-danger btn-sm delete-file" data-index="${index}">Удалить</button>
        `;
        fileList.appendChild(li);
    });
}

function updateFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = ''; // Очищаем список перед обновлением

    applicationData.files.forEach((file, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center bg-secondary text-white';
        li.innerHTML = `
            <span>${file.name}</span>
            <button class="btn btn-danger btn-sm delete-file" data-index="${index}">Удалить</button>
        `;
        fileList.appendChild(li);
    });
}
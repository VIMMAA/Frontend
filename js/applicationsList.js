const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', function (event) {
    event.preventDefault();
    const token = localStorage.getItem('jwtToken');

    fetch('https://okr.yzserver.ru/api/User/logout', {
        method: 'POST',
        headers: {
            accept: '*/*',
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => {
        if (response.ok) {
            console.log("Logout successful");
        } else {
            console.warn(`Logout error: ${response.status}`);
        }
    })
    .catch(error => {
        console.error("Logout error:", error);
    })
    .finally(handleLogout);
});

function handleLogout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');

    updateNavbar();

    window.location.href = 'authorization.html';
}

const authElements = document.querySelectorAll('.auth-only');
const guestElements = document.querySelectorAll('.guest-only');
const emailElement = document.getElementById('userEmail');

function updateNavbar() {
    const token = localStorage.getItem('jwtToken');
    const userEmail = localStorage.getItem('userEmail');
    const userRole = localStorage.getItem('userRole');

    if (token && userEmail) {
        authElements.forEach(el => el.classList.remove('d-none'));
        guestElements.forEach(el => el.classList.add('d-none'));
        emailElement.textContent = userEmail;

        document.querySelectorAll('.expectStudent').forEach(el => {
            el.parentElement.classList.toggle('d-none', userRole === 'Student');
        });
        document.querySelectorAll('.expectTeacher').forEach(el => {
            el.parentElement.classList.toggle('d-none', userRole === 'Teacher');
        });
    } else {
        authElements.forEach(el => el.classList.add('d-none'));
        guestElements.forEach(el => el.classList.remove('d-none'));
    }
}

updateNavbar();

function renderApplications(app) {
    const userRole = localStorage.getItem('userRole');

    const applicationContainer = document.getElementById('applicationContainer');
    const applicationTemplate = document.getElementById('applicationTemplate');
    const applicationClone = applicationTemplate.content.cloneNode(true);

    const applicationElement = applicationClone.querySelector('.card'); 
    applicationElement.setAttribute('data-app-id', app.id);

    const applicationNum = applicationClone.querySelector('.applicationNum');

    const makeDecision = applicationClone.querySelector('.makeDecision');
    const acceptButton = applicationClone.querySelector('.acceptButton');
    const rejectButton = applicationClone.querySelector('.rejectButton');

    const applicationStatus = applicationClone.querySelector('.applicationStatus');
    const acceptedApplication = applicationClone.querySelector('.acceptedApplication');
    const rejectedApplication = applicationClone.querySelector('.rejectedApplication');
    const editApplication = applicationClone.querySelector('.editApplication');
    const reviewApplication = applicationClone.querySelector('.reviewApplication');

    const applicationDate = applicationClone.querySelector('.applicationDate');

    applicationNum.textContent = app.id;
    applicationDate.textContent = new Date(app.submissionDate).toLocaleDateString();

    // NotDefined, Approved, Declined - статусы заявки
    // Student, Teacher, Dean, Admin  - роли пользователей

    if (userRole === "Student") { 
        applicationStatus.classList.remove("d-none");
        if (app.status === "NotDefined") {
            editApplication.classList.remove("d-none");

            editApplication.replaceWith(editApplication.cloneNode(true));
            const newEditButton = applicationClone.querySelector(".editApplication");

            newEditButton.addEventListener("click", () => {
                window.location.href = `index.html?id=${app.id}`; // переход на страницу редактирования
            });

            reviewApplication.classList.remove("d-none");
        } else if (app.status === "Approved") {
            acceptedApplication.classList.remove("d-none");
        } else if (app.status === "Declined") {
            rejectedApplication.classList.remove("d-none");
        }
    } else if (userRole === "Teacher") {
        applicationStatus.classList.remove("d-none");
        if (app.status === "NotDefined") {
            reviewApplication.classList.remove("d-none");
        } else if (app.status === "Approved") {
            acceptedApplication.classList.remove("d-none");
        } else if (app.status === "Declined") {
            rejectedApplication.classList.remove("d-none");
        }
    } else if (userRole === "Dean" || userRole === "Admin") {
        if (app.status === "NotDefined") {
            makeDecision.classList.remove("d-none");
            acceptButton.classList.remove("d-none");
            rejectButton.classList.remove("d-none");

            acceptButton.addEventListener("click", () => updateStatus(app.id, "approve"));
            rejectButton.addEventListener("click", () => updateStatus(app.id, "decline"));

        } else if (app.status === "Approved") {
            applicationStatus.classList.remove("d-none");
            acceptedApplication.classList.remove("d-none");
        } else if (app.status === "Declined") {
            applicationStatus.classList.remove("d-none");
            rejectedApplication.classList.remove("d-none");
        }
    }

    applicationNum.addEventListener('click', () => {
        window.location.href= `index.html?id=${app.id}`; //добавишь переход на страницу с информацией о заявке
    })

    applicationContainer.appendChild(applicationClone);
}

function updateStatus(applicationId, action) {
    const url = `https://okr.yzserver.ru/api/Application/${action}/${applicationId}`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                window.location.href = 'authorization.html';
            }
            throw new Error('Ошибка обновления статуса');
        }
        return response.json();
    })
    .then(() => {
        const applicationElement = document.querySelector(`[data-app-id="${applicationId}"]`);
        if (!applicationElement) return;

        const makeDecision = applicationElement.querySelector('.makeDecision');
        const applicationStatus = applicationElement.querySelector('.applicationStatus');
        const acceptedApplication = applicationElement.querySelector('.acceptedApplication');
        const rejectedApplication = applicationElement.querySelector('.rejectedApplication');

        makeDecision.classList.add("d-none");
        applicationStatus.classList.remove("d-none");

        if (action === "approve") {
            acceptedApplication.classList.remove("d-none");
            rejectedApplication.classList.add("d-none");
        } else if (action === "decline") {
            rejectedApplication.classList.remove("d-none");
            acceptedApplication.classList.add("d-none");
        }
    })
    .catch(error => {
        console.error("Ошибка:", error);
        alert("Не удалось обновить статус заявки");
    });
}

function loadApplications() {
    const token = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("id");

    if (!token || !userRole) {
        console.warn("Токен или роль пользователя отсутствуют. Перенаправление на страницу входа.");
        window.location.href = 'authorization.html';
        return;
    }

    let apiUrl;

    if (userRole === "Student") {
        const userId = getStudentIdFromToken();
        if (!userId) {
            console.error("Ошибка: не удалось получить ID студента из токена.");
            return;
        }
        apiUrl = `https://okr.yzserver.ru/api/Application/applicationList/${userId}`;
    } else if (["Admin", "Dean", "Teacher"].includes(userRole)) {
        apiUrl = studentId
            ? `https://okr.yzserver.ru/api/Application/applicationList/${studentId}`
            : "https://okr.yzserver.ru/api/Application/applicationList";
    } else {
        console.error("Неизвестная роль пользователя:", userRole);
        return;
    }

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwtToken');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                window.location.href = 'authorization.html';
            }
            throw new Error(`Ошибка получения заявок: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Ответ API:", data);
    
        const container = document.getElementById("applicationContainer");
        container.innerHTML = "";
    
        if (Array.isArray(data)) {
            if (userRole !== "Student" && data.length === 0) {
                alert('Пользователь не заявок');
                window.location.href = 'users.html';
            }
            data.forEach(app => renderApplications(app));
        } else if (data.applications && Array.isArray(data.applications)) {
            data.applications.forEach(app => renderApplications(app));
        } else {
            console.error("Ошибка: API вернул неверный формат данных.");
        }
    })
    .catch(error => {
        console.error('Не удалось загрузить заявки:', error);
        alert('Произошла ошибка при загрузке заявок');
    });
}

loadApplications();

//создание заявки
const createAppliacationButton = document.querySelector('.createAppliacationButton');
const token = localStorage.getItem('jwtToken');
const userEmail = localStorage.getItem('userEmail');
const userRole = localStorage.getItem('userRole');

if (token && userEmail && userRole === "Student") {
    createAppliacationButton.classList.remove('d-none');
} else {
    createAppliacationButton.classList.add('d-none');
}
    
createAppliacationButton.addEventListener('click' , () => {
    window.location.href = 'index.html'; //добавьть переход на страницу создания заявки
})


function getStudentIdFromToken() {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1])); 
    return payload.nameid ? payload.nameid[0] : null;

}
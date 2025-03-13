const userEmail = localStorage.getItem('userEmail');
const token = localStorage.getItem('jwtToken');
const userRole = localStorage.getItem('userRole');

const logoutButton = document.getElementById('logoutButton');

if (logoutButton) {
    logoutButton.addEventListener('click', function () {
        fetch ('', { // добавить взаимодействие с API
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                console.log("Logout successful");
            } else {
                console.warn(`Logout error: ${response.status}`);
            }
        })
        .catch(error => console.error("Logout error:", error))
        .finally(handleLogout);

    });
}

function handleLogout() {
    logoutButton.addEventListener('click', function () {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        updateNavbar();
        window.location.href = 'authorization.html';
    });
}   

const authElements = document.querySelectorAll('.auth-only');
const guestElements = document.querySelectorAll('.guest-only');
const emailElement = document.getElementById('userEmail');

function updateNavbar() {
    if (token && userEmail) {
        authElements.forEach(el => el.classList.remove('d-none'));
        guestElements.forEach(el => el.classList.add('d-none'));
        emailElement.textContent = userEmail;

        document.querySelectorAll('.expectStudent').forEach(el => {
            el.parentElement.classList.toggle('d-none', userRole === 'Student');
        });
    } else {
        authElements.forEach(el => el.classList.add('d-none'));
        guestElements.forEach(el => el.classList.remove('d-none'));
    }
}

updateNavbar();

function renderApplications(app) {
    const applicationContainer = document.getElementById('applicationContainer');
    const applicationTemplate = document.getElementById('applicationTemplate');
    const applicationClone = applicationTemplate.content.cloneNode(true);

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
    applicationDate.textContent = new Date(app.applicationDate).toLocaleDateString();

    //NotDefined Approved Declined - статусы заявки
    //Student Teacher Dean Admin   - роли пользователей

    if (userRole === "Student") { 
        applicationStatus.classList.remove("d-none");
        if (app.status === "NotDefined") {
            editApplication.classList.remove("d-none");
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
        } else if (app.status === "Approved") {
            acceptedApplication.classList.remove("d-none");
        } else if (app.status === "Declined") {
            rejectedApplication.classList.remove("d-none");
        }
    }

    applicationContainer.appendChild(applicationClone);
}

function loadApplications() {
    const urlParams = new URLSearchParams(window.location.search);
    const studentId = urlParams.get("studentId");

    let apiUrl;

    if (userRole === "Student") {
        const userId = getStudentIdFromToken();
        apiUrl = `/api/applications/student/${userId}`; //потом изменить
    } else if (userRole === "Admin" || userRole === "Dean" || userRole === "Teacher") {
        apiUrl = studentId ? `/api/applications/student/${studentId}` : "/api/applications"; //потом изменить
    } else {
        console.error("Неизвестная роль пользователя");
        return;
    }

    fetch(apiUrl, {     // добавить взаимодействие с API
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
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
            throw new Error('Ошибка получения заявок');
        }
        return response.json();
    })
    .then(apps => {
        document.getElementById("applicationContainer").innerHTML = "";
        apps.forEach(app => {
            renderApplications(app);
        })
    })
    .catch(error => {
        console.error('Не удалось загрузить заявки:', error);
        alert('Произошла ошибка при загрузке заявок');
    });
}

loadApplications();

//создание заявки
const createAppliacationButton = document.querySelector('.createAppliacationButton');
if (token && userEmail && userRole === "Student") {
    createAppliacationButton.classList.remove('d-none');
} else {
    createAppliacationButton.classList.add('d-none');
}
    
createAppliacationButton.addEventListener('click' , () => {
    window.location.href = 'index.html'; //добавьть переход на страницу создания заявки
})

//получение айди студента из токена
function getStudentIdFromToken() {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.studentId || null;
}
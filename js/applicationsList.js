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
    const createAppliacationButton = document.querySelector('.createAppliacationButton');
    const applicationNum = document.querySelector('.applicationNum');

    const makeDecision = document.querySelector('.makeDecision');
    const acceptButton = document.querySelector('.acceptButton');
    const rejectButton = document.querySelector('.rejectButton');

    const applicationStatus = document.querySelector('.applicationStatus');
    const acceptedApplication = document.querySelector('.acceptedApplication');
    const rejectedApplication = document.querySelector('.rejectedApplication');
    const editApplication = document.querySelector('.editApplication');
    const reviewApplication = document.querySelector('.reviewApplication');

    const applicationDate = document.querySelector('.applicationDate');

    const applicationContainer = document.getElementById('applicationContainer');
    const applicationTemplate = document.getElementById('applicationTemplate');
    const applicationClone = applicationTemplate.contentEditable.cloneNode(true);


    applicationNum.textContent = app.id;
    applicationDate.textContent = new Date(app.applicationDate).toLocaleDateString();

    //NotDefined Approved Declined - статусы заявки
    //Student Teacher Dean Admin   - роли пользователей

    if (userRole === "Student") { 
        applicationStatus.classList.remove("d-none");
        createAppliacationButton.classList.remove("d-none");
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
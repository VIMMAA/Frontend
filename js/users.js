const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', function (event) {
    event.preventDefault();
    const token = localStorage.getItem('jwtToken');

    fetch ('https://okr.yzserver.ru/api/User/logout', {
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
    .catch(error => console.error("Logout error:", error))
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
    const userEmail = localStorage.getItem('userEmail');
    const token = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');

    if (token && userEmail) {
        authElements.forEach(el => el.classList.remove('d-none'));
        guestElements.forEach(el => el.classList.add('d-none'));
        emailElement.textContent = userEmail;

        document.querySelectorAll('.expectTeacher').forEach(el => {
            el.parentElement.classList.toggle('d-none', userRole === 'Teacher');
        });
    } else {
        authElements.forEach(el => el.classList.add('d-none'));
        guestElements.forEach(el => el.classList.remove('d-none'));
    }
}

updateNavbar();


function renderPeople(user) {
    const userContainer = document.getElementById('userContainer');
    const userTemplate = document.getElementById('userTemplate');
    const userClone = userTemplate.content.cloneNode(true);

    const userFullName = userClone.querySelector('.userFullName');
    const cardUserRole = userClone.querySelector('.cardUserRole');

    userFullName.textContent = `${user.middleName} ${user.firstName} ${user.lastName || ''}`.trim();
    cardUserRole.textContent = user.role;

    if (cardUserRole.textContent.trim() === "Student") {
        userFullName.style.cursor = "pointer";
        userFullName.addEventListener('click', () => {
            window.location.href = `applicationsList.html?id=${user.id}`;
        });
    }

    userContainer.appendChild(userClone);
}

function loadUsers() {
    const token = localStorage.getItem('jwtToken');
    const userRole = localStorage.getItem('userRole');

    if (!token || !userRole) {
        console.warn("Токен или роль пользователя отсутствуют. Перенаправление на страницу входа.");
        window.location.href = 'authorization.html';
        return;
    }

    let apiUrl;

    if (userRole === "Teacher") {
        apiUrl = `https://okr.yzserver.ru/api/UserList?role=Student`;
    } else if (["Admin", "Dean"].includes(userRole)) {
        apiUrl = 'https://okr.yzserver.ru/api/UserList';
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
        data.forEach(user => renderPeople(user));
    })
    .catch(error => {
        console.error('Не удалось загрузить заявки:', error);
        alert('Произошла ошибка при загрузке заявок');
    });
}

loadUsers();

const userRole = localStorage.getItem('userRole');
const token = localStorage.getItem('jwtToken');

if (userRole === "Dean") {
    const registrationAccordion = document.getElementById('registrationAccordion');
    const roleSelect = document.getElementById('roleSelect');
    const registrationLink = document.getElementById('registrationLink');
    const copyButton = document.querySelector('.copyLinkButton');
    const createLinkButton = document.querySelector('.createLinkButton');

    registrationAccordion.classList.remove('d-none');

    createLinkButton.addEventListener('click', () => {
        const role = roleSelect.value;
        const apiUrl = `https://okr.yzserver.ru/api/InvitationLink?role=${role}`;

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
                throw new Error(`Ошибка получения ссылки: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            registrationLink.value = `http://127.0.0.1:5500/html/registration.html?id=${data.generatedLink}`;
        })
        .catch(error => {
            console.error('Ошибка при загрузке ссылки:', error);
            alert('Произошла ошибка при загрузке ссылки');
        });
    });

    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(registrationLink.value)
            .then(() => {
                console.log("Ссылка скопирована:", registrationLink.value);
                alert('Ссылка скопирована');
            })
            .catch(err => console.error("Ошибка копирования:", err));
    });
}

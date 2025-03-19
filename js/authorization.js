const userEmail = localStorage.getItem('userEmail');
const token = localStorage.getItem('jwtToken');
const userRole = localStorage.getItem('userRole');

if (token) {
    if (userRole === "Teacher") {
        window.location.href = 'users.html';
    }
    else if (userRole !== "Teacher" && !(window.location.href.includes('applicationsList.html') || window.location.href.includes('schedule.html'))) {
        window.location.href = 'applicationsList.html';
    }
}


const authElements = document.querySelectorAll('.auth-only');
const guestElements = document.querySelectorAll('.guest-only');
const emailElement = document.getElementById('userEmail');

function updateNavbar() {
    if (token && userEmail) {
        authElements.forEach(el => el.classList.remove('d-none'));
        guestElements.forEach(el => el.classList.add('d-none'));
        emailElement.textContent = userEmail;
    } else {
        authElements.forEach(el => el.classList.add('d-none'));
        guestElements.forEach(el => el.classList.remove('d-none'));
    }
}

updateNavbar();

document.querySelector('button.btn-secondary').addEventListener('click', function () {
    window.location.href = 'registration.html';
});

document.querySelector('form').addEventListener('submit', function (event) {
    event.preventDefault();

    const password = document.getElementById('inputPassword').value;
    const email = document.getElementById('inputEmail').value;

    let isValid = true;

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
        isValid = false;
        setInvalid('inputEmail', 'emailFeedback');
    } else {
        setValid('inputEmail');
    }

    if (isValid) {
        const data = {
            password: password,
            email: email,
        };

        fetch('https://okr.yzserver.ru/api/User/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => Promise.reject(error));
                }
                return response.json();
            })
            .then(data => {
                if (data.token) {
                    setValid('inputPassword', 'passwordFeedback');

                    localStorage.setItem('jwtToken', data.token);
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userRole', data.role)

                    if (data.role === "Teacher") {
                        window.location.href = 'users.html';
                    }
                    else {
                        window.location.href = 'applicationsList.html';
                    }
                    
                }
            })
            .catch(error => {
                if (error.message === 'Invalid email or password') {
                    setInvalid('inputPassword', 'passwordFeedback', 'Неправильный логин или пароль.');
                } else {
                    console.error('Ошибка при авторизации:', error);
                    alert('Произошла ошибка: ' + error.message);
                }
            });
    }
});

function setInvalid(inputId, feedbackId, message) {
    const input = document.getElementById(inputId);
    const feedback = document.getElementById(feedbackId);
    input.classList.add('is-invalid');
    feedback.textContent = message;
}

function setValid(inputId) {
    const input = document.getElementById(inputId);
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
}
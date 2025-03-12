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

        document.querySelectorAll('.expectTeacher').forEach(el => {
            el.parentElement.classList.toggle('d-none', userRole === 'Teacher');
        });
    } else {
        authElements.forEach(el => el.classList.add('d-none'));
        guestElements.forEach(el => el.classList.remove('d-none'));
    }
}

updateNavbar();
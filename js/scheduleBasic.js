if (window.location.href.includes("schedule.html")) {
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
} else {
    localStorage.removeItem("PUTSKIP");
}
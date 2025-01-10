async function postData(url, data) {
    console.log(data)
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return response
}

async function register() {
    const formData = new FormData(registerForm)
    const data = Object.fromEntries(formData.entries())
    data.isAdmin = formData.has('isAdmin')
    
    const response = await postData('/api/user/register', data)

    if (response.ok) {
        alert('Registration successfull!')
        window.location.href = '/login.html';
    } else {
        alert('Registration failed!');
    }
}

async function login() {
    const formData = new FormData(loginForm)
    const data = Object.fromEntries(formData.entries())

    const response = await postData('/api/user/login', data)

    if (response.ok) {
        const result = await response.json()
        alert('Login successfull!')
        localStorage.setItem('token', result.token)
        window.location.href = '/'
    } else {
        alert('Login failed!');
    }
}

async function logout() {
    localStorage.removeItem('token')
    
    window.location.href = '/login.html'
}

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname
    console.log("The path is", path)

    if(path.includes('register.html')){
        const registerForm = document.getElementById('registerForm')
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault()
            console.log("Register pushed!")
            register()
        })
    }else if(path.includes('login.html')){
        const loginForm = document.getElementById('loginForm')
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault()
            login()
        })
    }else if (path === '/'){
        console.log("index.html")
        
        const token = localStorage.getItem('token')
        if(token){
            const payload = JSON.parse(atob(token.split('.')[1]));
            const adminStatus = document.getElementById('adminStatus')
            console.log(payload)
            adminStatus.textContent = `Logged in as ${payload.username}. Admin: ${payload.isadmin}`;

            document.getElementById("logoutButton").addEventListener('click', async () => {
                try {
                    const response = await fetch('/api/user/logout', {
                        method: 'POST',
                        credentials: 'include'
                    })
                    if (response.ok){
                        window.location.href = '/register.html'
                    }else{
                        alert('Failed to log out')
                    }
                } catch (error) {
                    console.error('Logout error:', error)
                    alert('An error occured during logout')
                }
            })

        }else {
            window.location.href = '/login.html'
        }
    }
})
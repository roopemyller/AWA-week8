async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
    return response
}

async function register() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const response = await postData('/api/user/register', {email, password})

    if (response.ok) {
        alert('Registration successfull!')
        window.location.href = '/login.html';
    } else {
        alert('Registration failed!');
    }
}

async function login() {
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const response = await postData('/api/user/login', {email, password})

    if (response.ok) {
        const data = await response.json()
        alert('Login successfull!')
        localStorage.setItem('token', data.token)
        window.location.href = '/'
    } else {
        alert('Login failed!');
    }
}

async function validateToken() {
    const token = localStorage.getItem('token');
        
    if (token) {
        try {
            const response = await fetch('/api/private', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                console.log(data.message)
            } else {
                alert('Session expired or invalid token!')
                window.location.href = '/login.html'
            }
        } catch (error) {
            console.error('Error validating token:', error)
            alert('Error validating token!')
            window.location.href = '/login.html'
        }
    } else {
        window.location.href = '/login.html'
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
        
        validateToken()

        const token = localStorage.getItem('token')
        if(token){
            const logoutButton = document.getElementById('logout')
            if(logoutButton){
                logoutButton.addEventListener('click', logout)
            }
        }else {
            window.location.href = '/login.html'
        }
    }
})
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

    const username = document.getElementById('username').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const isAdmin = document.getElementById('isAdmin').checked
    const response = await postData('/api/user/register', {username, email, password, isAdmin})

    if (response.ok) {
        alert('Registration successfull!')
        window.location.href = '/';
    } else {
        alert('Registration failed!');
    }
}

async function login() {
    console.log("Login pushed!")

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const response = await postData('/api/user/login', {email, password})

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
    
    window.location.href = '/'
}

async function fetchTopics() {
    const response = await fetch('/api/topics')
    const topics = await response.json()
    const topicsDiv = document.getElementById('topics')
    topicsDiv.innerHTML = ''

    topics.forEach(topic => {
        const topicDiv = document.createElement('div')
        topicDiv.classList.add('card', 'z-depth-2', 'hoverable', 'grey', 'lighten-2')

        const contentDiv = document.createElement('div')
        contentDiv.classList.add('card-content')

        const titleSpan = document.createElement('span')
        titleSpan.classList.add('card-title')

        const contentP = document.createElement('p')
        const userP = document.createElement('p')
        userP.classList.add('grey-text', 'text-darken-2')

        const actionDiv = document.createElement('div')
        actionDiv.classList.add('card-action')

        const deleteButton = document.createElement('button')
        deleteButton.classList.add('btn', 'waves-effect', 'waves-light')

        titleSpan.textContent = topic.title
        contentP.textContent = topic.content    
        userP.textContent = `Posted by ${topic.username} on ${new Date(topic.createdAt).toLocaleString()}`

        contentDiv.appendChild(titleSpan)
        contentDiv.appendChild(contentP)
        contentDiv.appendChild(userP)
        actionDiv.appendChild(deleteButton)

        deleteButton.textContent = 'Delete'
        deleteButton.id = 'deleteTopic'
        deleteButton.addEventListener('click', async () => {
            const response = await fetch(`/api/topic/${topic._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })

            if (response.ok) {
                topicDiv.remove()
                alert('Topic deleted!')
                fetchTopics()
            } else {
                const errorData = await response.json()
                console.log("Error data is", errorData) 
                alert('Failed to delete topic!')
            }
        })

        
        topicDiv.appendChild(contentDiv)
        topicDiv.appendChild(actionDiv)
        topicsDiv.appendChild(topicDiv)
    })
}

async function postTopic() {
    console.log("Post topic pushed!")
    console.log("Token is", localStorage.getItem('token'))
    const topicTitle = document.getElementById('topicTitle').value
    const topicText = document.getElementById('topicText').value

    const data = {title: topicTitle, content: topicText}

    const response = await fetch('/api/topic', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
    })

    if (response.ok) {
        alert('Topic posted!')
        fetchTopics()
        topicTitle.textContent = ""
        topicText.textContent = ""
    } else {
        const errorData = await response.json()
        alert('Failed to post topic! ' + errorData.error)
    }
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
    }else {
        const loginForm = document.getElementById('loginForm')
        const registerLink = document.querySelector('a[href="/register.html"]')
        const logoutButton = document.getElementById('logoutButton')
        const token = localStorage.getItem('token')

        if(token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const adminStatus = document.getElementById('adminStatus')
            adminStatus.textContent = `Logged in as ${payload.username}. Admin: ${payload.isadmin}`;

            loginForm.style.display = 'none'
            registerLink.style.display = 'none'
            logoutButton.style.display = 'block'

            const topicTitleInput = document.createElement('input')
            topicTitleInput.setAttribute('type', 'text')
            topicTitleInput.setAttribute('id', 'topicTitle')
            topicTitleInput.setAttribute('placeholder', 'Topic Title')

            const topicTextArea = document.createElement('textarea')
            topicTextArea.setAttribute('id', 'topicText')
            topicTextArea.setAttribute('placeholder', 'Topic Content')
            topicTextArea.setAttribute('class', 'materialize-textarea')
            topicTextArea.classList.add('materialize-textarea')

            const postTopicButton = document.createElement('button')
            postTopicButton.setAttribute('id', 'postTopic')
            postTopicButton.setAttribute('type', 'submit')
            postTopicButton.textContent = 'Post Topic'
            postTopicButton.classList.add('btn', "waves-effect", "waves-light")

            topicForm.appendChild(topicTitleInput)
            topicForm.appendChild(topicTextArea)
            topicForm.appendChild(postTopicButton)

            document.getElementById('topicForm').style.display = 'block'
            fetchTopics()

            postTopicButton.addEventListener('click', (e) => {
                e.preventDefault()
                postTopic()
            })


            logoutButton.addEventListener('click', async () => {
                try {
                    const response = await fetch('/api/user/logout', {
                        method: 'POST',
                        credentials: 'include'
                    })
                    if (response.ok){
                        localStorage.removeItem('token')
                        window.location.href = '/'
                    }else{
                        alert('Failed to log out')
                    }
                } catch (error) {
                    console.error('Logout error:', error)
                    alert('An error occured during logout')
                }
            })

        }else{
            loginForm.style.display = 'flex'
            registerLink.style.display = 'block'
            logoutButton.style.display = 'none'
            document.getElementById('topicForm').innerHTML = ''

            fetchTopics()

            loginForm.addEventListener('submit', (e) => {
                e.preventDefault()
                login()
            })

        }
    }
})
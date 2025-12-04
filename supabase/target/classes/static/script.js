// API Base URL - UPDATE THIS to your backend URL
const API_URL = 'http://localhost:8080/api';

let currentAccount = null;

// Show/Hide Forms
function showLoginForm() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('registerTab').classList.remove('active');
}

function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginTab').classList.remove('active');
    document.getElementById('registerTab').classList.add('active');
}

// Show Message
function showMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    el.innerHTML = `<div class="${isError ? 'error' : 'success'}">${message}</div>`;
    setTimeout(() => el.innerHTML = '', 3000);
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/accounts/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });


        if (response.ok) {
            currentAccount = await response.json();
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('todoSection').classList.remove('hidden');
            document.getElementById('currentUser').textContent = currentAccount.username;
            await loadTodos();
        } else {
            showMessage('authMessage', 'Invalid username or password', true);
        }
    } catch (error) {
        showMessage('authMessage', 'Login failed. Please try again.', true);
    }
});

// Register
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch(`${API_URL}/accounts/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            showMessage('authMessage', 'Registration successful! Please login.');
            showLoginForm();
            document.getElementById('registerForm').reset();
        } else {
            showMessage('authMessage', 'Registration failed. Username may already exist.', true);
        }
    } catch (error) {
        showMessage('authMessage', 'Registration failed. Please try again.', true);
    }
});

// Logout
function logout() {
    currentAccount = null;
    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('todoSection').classList.add('hidden');
    document.getElementById('loginForm').reset();
    document.getElementById('todoList').innerHTML = '';
}

// Load Todos
async function loadTodos() {
    try {
        const response = await fetch(`${API_URL}/todos/my`, {
            credentials: 'include'
        });
        if (!response.ok) {
            console.log("LoadTodos response status:", response.status);
            throw new Error();
        }
        const todos = await response.json();
        renderTodos(todos);
    } catch (error) {
        showMessage('todoMessage', 'Failed to load todos', true);
    }
}

// Render Todos
function renderTodos(todos) {
    const list = document.getElementById('todoList');
    list.innerHTML = '';

    if (todos.length === 0) {
        list.innerHTML = '<li style="text-align: center; color: #999; padding: 20px;">No todos yet. Add one above!</li>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.innerHTML = `
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="toggleTodo(${todo.id}, this.checked)">
                    <div class="todo-content">
                        <div class="todo-title">${escapeHtml(todo.title)}</div>
                        ${todo.note ? `<div class="todo-note">${escapeHtml(todo.note)}</div>` : ''}
                    </div>
                    <div class="todo-actions">
                        <button class="danger" onclick="deleteTodo(${todo.id},${todo.completed})">Delete</button>
                    </div>
                `;
        list.appendChild(li);
    });
}

// Add Todo
document.getElementById('addTodoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('todoTitle').value.trim();
    const note = document.getElementById('todoNote').value.trim();

    if (!currentAccount || !currentAccount.id) {
        return showMessage('todoMessage', 'You must log in first', true);
    }

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            credentials: 'include', // IMPORTANT for Spring Security sessions
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                note,
                completed: false,
                account: currentAccount.id
            })
        });

        if (!response.ok) throw new Error();

        document.getElementById('addTodoForm').reset();
        showMessage('todoMessage', 'Todo added successfully!');
        await loadTodos();

    } catch (error) {
        showMessage('todoMessage', 'Failed to add todo' + error.toString(), true);
    }
});


// Toggle Todo
async function toggleTodo(id, completed) {
    try {
        await fetch(`${API_URL}/todos/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });

        await loadTodos();
    } catch (error) {
        showMessage('todoMessage', 'Failed to update todo', true);
    }
}

// Delete Todo
async function deleteTodo(id,completed) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        await fetch(`${API_URL}/todos/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed })
        });

        showMessage('todoMessage', 'Todo deleted successfully!');
        await loadTodos();
    } catch (error) {
        showMessage('todoMessage', 'Failed to delete todo', true);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
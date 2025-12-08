// API Base URL - UPDATE THIS to your backend URL
const API_URL = 'http://localhost:8080/api';

let currentAccount = null;
let authToken = null;
let allTodos = [];

// Check session on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
});

// Check if user has valid token
async function checkAuth() {
    authToken = localStorage.getItem('authToken');

    if (!authToken) {
        console.log('No token found');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/accounts/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            currentAccount = await response.json();
            console.log('Token valid for user:', currentAccount.username);

            // Show todo section
            const authSection = document.getElementById('authSection');
            const todoSection = document.getElementById('todoSection');

            if (authSection) authSection.classList.add('hidden');
            if (todoSection) {
                todoSection.classList.remove('hidden');
                document.getElementById('currentUser').textContent = currentAccount.username;
                await loadTodos();
            }
        } else {
            // Token invalid or expired
            console.log('Token invalid, clearing...');
            localStorage.removeItem('authToken');
            authToken = null;
        }
    } catch (error) {
        console.log('Auth check failed:', error);
        localStorage.removeItem('authToken');
        authToken = null;
    }
}

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
    if (el) {
        el.innerHTML = `<div class="${isError ? 'error' : 'success'}">${message}</div>`;
        setTimeout(() => el.innerHTML = '', 4000);
    }
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${API_URL}/accounts/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                currentAccount = data.account;
                authToken = data.token;

                // Store token in localStorage
                localStorage.setItem('authToken', authToken);

                console.log('Login successful, token stored');

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
}

// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
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
}

// Logout
function logout() {
    currentAccount = null;
    authToken = null;
    localStorage.removeItem('authToken');

    console.log('Logged out, token removed');

    document.getElementById('authSection').classList.remove('hidden');
    document.getElementById('todoSection').classList.add('hidden');
    document.getElementById('loginForm').reset();
    document.getElementById('todoList').innerHTML = '';
}

// Load Todos
async function loadTodos() {
    try {
        const response = await fetch(`${API_URL}/todos/my`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.status === 401) {
            showMessage('todoMessage', 'Session expired. Please login again.', true);
            setTimeout(() => {
                logout();
            }, 2000);
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to load todos');
        }

        allTodos = await response.json();
        filterAndSortTodos();
    } catch (error) {
        showMessage('todoMessage', 'Failed to load todos', true);
    }
}

// Filter and Sort Todos
function filterAndSortTodos() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    if (!searchInput || !sortSelect) return;

    const searchTerm = searchInput.value.toLowerCase();
    const sortBy = sortSelect.value;

    let filteredTodos = allTodos.filter(todo => {
        const titleMatch = todo.title.toLowerCase().includes(searchTerm);
        const noteMatch = todo.note && todo.note.toLowerCase().includes(searchTerm);
        return titleMatch || noteMatch;
    });

    switch(sortBy) {
        case 'title-asc':
            filteredTodos.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'title-desc':
            filteredTodos.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'completed':
            filteredTodos.sort((a, b) => (b.completed ? 1 : 0) - (a.completed ? 1 : 0));
            break;
        case 'uncompleted':
            filteredTodos.sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));
            break;
    }

    renderTodos(filteredTodos);
}

// Render Todos
function renderTodos(todos) {
    const list = document.getElementById('todoList');
    if (!list) return;

    list.innerHTML = '';

    if (todos.length === 0) {
        const searchInput = document.getElementById('searchInput');
        const searchTerm = searchInput ? searchInput.value : '';
        const message = searchTerm
            ? `No todos found matching "${searchTerm}" 🔍`
            : 'No todos yet. Add your first task above! 🎯';
        list.innerHTML = `<li class="empty-state">${message}</li>`;
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        // Truncate title and note
        const truncatedTitle = todo.title.length > 50 ? todo.title.substring(0, 50) + '...' : todo.title;
        const truncatedNote = todo.note && todo.note.length > 80 ? todo.note.substring(0, 80) + '...' : todo.note;

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} 
                   onclick="event.stopPropagation(); toggleTodo(${todo.id}, this.checked)">
            <div class="todo-content" onclick="goToDetail(${todo.id})">
                <div class="todo-title">${escapeHtml(truncatedTitle)}</div>
                ${truncatedNote ? `<div class="todo-note">${escapeHtml(truncatedNote)}</div>` : ''}
            </div>
        `;
        list.appendChild(li);
    });
}

// Go to detail page
function goToDetail(id) {
    window.location.href = `detail.html?id=${id}`;
}

// Add Todo
const addTodoForm = document.getElementById('addTodoForm');
if (addTodoForm) {
    addTodoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('todoTitle').value;
        const note = document.getElementById('todoNote').value;

        try {
            const response = await fetch(`${API_URL}/todos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    title,
                    note,
                    completed: false
                })
            });

            if (response.ok) {
                document.getElementById('addTodoForm').reset();
                showMessage('todoMessage', 'Todo added successfully! 🎉');
                await loadTodos();
            } else {
                showMessage('todoMessage', 'Failed to add todo', true);
            }
        } catch (error) {
            showMessage('todoMessage', 'Failed to add todo', true);
        }
    });
}

// Toggle Todo
async function toggleTodo(id, completed) {
    try {
        await fetch(`${API_URL}/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ completed })
        });
        await loadTodos();
    } catch (error) {
        showMessage('todoMessage', 'Failed to update todo', true);
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
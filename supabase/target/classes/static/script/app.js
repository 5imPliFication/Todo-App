const API_URL = 'http://localhost:8080/api';

let currentAccount = null;

// Check session on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
});

// Check if user has active session
async function checkSession() {
    try {
        const response = await fetch(`${API_URL}/accounts/me`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            currentAccount = await response.json();
            console.log('Session found for user:', currentAccount.username);

            // Show todo section
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('todoSection').classList.remove('hidden');
            document.getElementById('currentUser').textContent = currentAccount.username;
            await loadTodos();
        } else {
            console.log('No active session');
        }
    } catch (error) {
        console.log('Session check failed:', error);
        // Stay on login page
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
    el.innerHTML = `<div class="${isError ? 'error' : 'success'}">${message}</div>`;
    setTimeout(() => el.innerHTML = '', 4000);
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
async function logout() {
    try {
        await fetch(`${API_URL}/accounts/logout`, {
            method: 'POST',
            credentials: 'include' // VERY IMPORTANT to send the session cookie
        });
    } catch (error) {
        console.error("Logout failed:", error);
    }

    // Clear UI state
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
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load todos');
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
        list.innerHTML = '<li class="empty-state">No todos yet. Add your first task above! 🎯</li>';
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
                        <button class="edit" onclick="openEditModal(${todo.id}, '${escapeHtml(todo.title).replace(/'/g, "\\'")}', '${escapeHtml(todo.note || '').replace(/'/g, "\\'")}', ${todo.completed})">Edit</button>
                        <button class="danger" onclick="deleteTodo(${todo.id})">Delete</button>
                    </div>
                `;
        list.appendChild(li);
    });
}

// Add Todo
document.getElementById('addTodoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('todoTitle').value;
    const note = document.getElementById('todoNote').value;

    try {
        const response = await fetch(`${API_URL}/todos`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                note,
                completed: false,
                accountId: currentAccount.id
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
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        showMessage('todoMessage', 'Todo deleted successfully! ✓');
        await loadTodos();
    } catch (error) {
        showMessage('todoMessage', 'Failed to delete todo', true);
    }
}

// Open Edit Modal
function openEditModal(id, title, note, completed) {
    document.getElementById('editTodoId').value = id;
    document.getElementById('editTodoTitle').value = title;
    document.getElementById('editTodoNote').value = note;
    document.getElementById('editTodoCompleted').checked = completed;
    document.getElementById('editModal').classList.add('active');
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editTodoForm').reset();
}

// Edit Todo Form Submit
document.getElementById('editTodoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editTodoId').value;
    const title = document.getElementById('editTodoTitle').value;
    const note = document.getElementById('editTodoNote').value;
    const completed = document.getElementById('editTodoCompleted').checked;

    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                note,
                completed
            })
        });

        if (response.ok) {
            showMessage('todoMessage', 'Todo updated successfully! ✓');
            closeEditModal();
            await loadTodos();
        } else {
            showMessage('todoMessage', 'Failed to update todo', true);
        }
    } catch (error) {
        showMessage('todoMessage', 'Failed to update todo', true);
    }
});

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') {
        closeEditModal();
    }
});

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
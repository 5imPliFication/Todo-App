// API Base URL - UPDATE THIS to your backend URL
const API_URL = 'http://localhost:8080/api';

let currentTodo = null;
let currentAccount = null;
let authToken = null;

// Check auth and load todo on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuthAndLoadTodo();
});

async function checkAuthAndLoadTodo() {
    try {
        // Check if token exists
        authToken = localStorage.getItem('authToken');

        if (!authToken) {
            // Not logged in, redirect to home
            window.location.href = 'index.html';
            return;
        }

        // Verify token is valid
        const authResponse = await fetch(`${API_URL}/accounts/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!authResponse.ok) {
            // Token invalid, redirect to login
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
            return;
        }

        currentAccount = await authResponse.json();

        // Get todo ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const todoId = urlParams.get('id');

        if (!todoId) {
            window.location.href = 'index.html';
            return;
        }

        // Load todo details
        await loadTodoDetail(todoId);

    } catch (error) {
        console.log('Error:', error);
        window.location.href = 'index.html';
    }
}

async function loadTodoDetail(id) {
    try {
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Todo not found');
        }

        currentTodo = await response.json();
        renderTodoDetail();

    } catch (error) {
        showMessage('detailMessage', 'Failed to load todo details', true);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

function renderTodoDetail() {
    document.getElementById('todoTitle').textContent = currentTodo.title;
    document.getElementById('todoNote').textContent = currentTodo.note || 'No notes';

    const completedBadge = document.getElementById('todoCompleted');
    if (currentTodo.completed) {
        completedBadge.textContent = '✓ Completed';
        completedBadge.className = 'detail-value completed-badge yes';
    } else {
        completedBadge.textContent = '○ Not Completed';
        completedBadge.className = 'detail-value completed-badge no';
    }
}

function showMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    el.innerHTML = `<div class="${isError ? 'error' : 'success'}">${message}</div>`;
    setTimeout(() => el.innerHTML = '', 4000);
}

// Toggle completion
async function toggleCompletion() {
    try {
        const newStatus = !currentTodo.completed;
        const response = await fetch(`${API_URL}/todos/${currentTodo.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ completed: newStatus })
        });

        if (response.ok) {
            currentTodo.completed = newStatus;
            renderTodoDetail();
            showMessage('detailMessage', 'Status updated successfully! ✓');
        } else {
            showMessage('detailMessage', 'Failed to update status', true);
        }
    } catch (error) {
        showMessage('detailMessage', 'Failed to update status', true);
    }
}

// Edit todo
function editTodo() {
    const newTitle = prompt('Edit Title:', currentTodo.title);
    if (newTitle === null) return;

    const newNote = prompt('Edit Note:', currentTodo.note || '');
    if (newNote === null) return;

    updateTodo(newTitle, newNote);
}

async function updateTodo(title, note) {
    try {
        const response = await fetch(`${API_URL}/todos/${currentTodo.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ title, note })
        });

        if (response.ok) {
            currentTodo.title = title;
            currentTodo.note = note;
            renderTodoDetail();
            showMessage('detailMessage', 'Todo updated successfully! ✓');
        } else {
            showMessage('detailMessage', 'Failed to update todo', true);
        }
    } catch (error) {
        showMessage('detailMessage', 'Failed to update todo', true);
    }
}

// Delete todo
async function deleteTodo() {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    try {
        const response = await fetch(`${API_URL}/todos/${currentTodo.id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            showMessage('detailMessage', 'Todo deleted successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showMessage('detailMessage', 'Failed to delete todo', true);
        }
    } catch (error) {
        showMessage('detailMessage', 'Failed to delete todo', true);
    }
}
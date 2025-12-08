const API_URL = 'http://localhost:8080/api';

let currentTodo = null;
let currentAccount = null;
let authToken = null;
let originalTodoData = null;
let hasUnsavedChanges = false;

// Check auth and load todo on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkAuthAndLoadTodo();
});

// Warn before leaving page with unsaved changes
function setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        }
    });
}

// Listen for form changes
function setupFormListeners() {
    const titleInput = document.getElementById('todoTitle');
    const noteInput = document.getElementById('todoNote');
    const completedInput = document.getElementById('todoCompleted');

    if (titleInput) titleInput.addEventListener('input', () => {
        validateForm();
        checkForChanges();
    });

    if (noteInput) noteInput.addEventListener('input', checkForChanges);
    if (completedInput) completedInput.addEventListener('change', checkForChanges);
}

async function checkAuthAndLoadTodo() {
    try {
        authToken = localStorage.getItem('authToken');

        if (!authToken) {
            window.location.href = 'index.html';
            return;
        }

        const authResponse = await fetch(`${API_URL}/accounts/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!authResponse.ok) {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
            return;
        }

        currentAccount = await authResponse.json();

        const urlParams = new URLSearchParams(window.location.search);
        const todoId = urlParams.get('id');

        if (!todoId) {
            window.location.href = 'index.html';
            return;
        }

        await loadTodoDetail(todoId);

        setupFormListeners();
        setupBeforeUnload();

    } catch (error) {
        console.log('Error:', error);
        window.location.href = 'index.html';
    }
}

function validateForm() {
    const titleInput = document.getElementById('todoTitle');
    const titleError = document.getElementById('titleError');
    const saveBtn = document.getElementById('saveBtn');

    if (!titleInput || !saveBtn) return false;

    const isValid = titleInput.value.trim() !== '';

    if (titleError) {
        titleError.textContent = isValid ? '' : 'Title is required';
    }

    saveBtn.disabled = !isValid || !hasUnsavedChanges;

    return isValid;
}

function checkForChanges() {
    if (!currentTodo || !originalTodoData) return false;

    const titleInput = document.getElementById('todoTitle');
    const noteInput = document.getElementById('todoNote');
    const completedInput = document.getElementById('todoCompleted');

    if (!titleInput || !noteInput || !completedInput) return false;

    const titleChanged = titleInput.value !== originalTodoData.title;
    const noteChanged = noteInput.value !== (originalTodoData.note || '');
    const completedChanged = completedInput.checked !== originalTodoData.completed;

    hasUnsavedChanges = titleChanged || noteChanged || completedChanged;

    validateForm();

    return hasUnsavedChanges;
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

        originalTodoData = { ...currentTodo };

        renderTodoDetail();

    } catch (error) {
        showMessage('detailMessage', 'Failed to load todo details', true);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

function renderTodoDetail() {
    const titleInput = document.getElementById('todoTitle');
    const noteInput = document.getElementById('todoNote');
    const completedInput = document.getElementById('todoCompleted');
    const todoIdInput = document.getElementById('todoId');
    const saveBtn = document.getElementById('saveBtn');

    if (titleInput) titleInput.value = currentTodo.title;
    if (noteInput) noteInput.value = currentTodo.note || '';
    if (completedInput) completedInput.checked = currentTodo.completed;
    if (todoIdInput) todoIdInput.value = currentTodo.id;

    if (saveBtn) {
        saveBtn.disabled = true;
    }

    hasUnsavedChanges = false;
    validateForm();
}

function showMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    if (el) {
        el.innerHTML = `<div class="${isError ? 'error' : 'success'}">${message}</div>`;
        setTimeout(() => el.innerHTML = '', 4000);
    }
}

async function saveTodo() {
    if (!validateForm()) {
        showMessage('detailMessage', 'Please fix validation errors', true);
        return;
    }

    const saveBtn = document.getElementById('saveBtn');
    if (!saveBtn) return;

    const originalText = saveBtn.innerHTML;

    try {
        saveBtn.innerHTML = '⏳ Saving...';
        saveBtn.disabled = true;

        const titleInput = document.getElementById('todoTitle');
        const noteInput = document.getElementById('todoNote');
        const completedInput = document.getElementById('todoCompleted');

        const updatedTodo = {
            title: titleInput.value.trim(),
            note: noteInput.value.trim(),
            completed: completedInput.checked
        };

        const response = await fetch(`${API_URL}/todos/${currentTodo.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updatedTodo)
        });

        if (response.ok) {
            currentTodo = await response.json();

            originalTodoData = { ...currentTodo };
            hasUnsavedChanges = false;

            showMessage('detailMessage', 'Todo saved successfully! ✓');

            saveBtn.innerHTML = originalText;
            saveBtn.disabled = true;

        } else {
            const errorText = await response.text();
            showMessage('detailMessage', `Failed to save: ${errorText || 'Unknown error'}`, true);
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }

    } catch (error) {
        console.error('Save error:', error);
        showMessage('detailMessage', 'Network error. Please try again.', true);
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

function cancelEdit() {
    if (hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            return;
        }
    }

    if (originalTodoData) {
        document.getElementById('todoTitle').value = originalTodoData.title;
        document.getElementById('todoNote').value = originalTodoData.note || '';
        document.getElementById('todoCompleted').checked = originalTodoData.completed;

        hasUnsavedChanges = false;

        const saveBtn = document.getElementById('saveBtn');
        if (saveBtn) saveBtn.disabled = true;

        validateForm();
        showMessage('detailMessage', 'Changes discarded', false);
    }
}

async function deleteTodo() {
    const modal = document.getElementById('deleteModal');
    if (modal) modal.style.display = 'none';

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

function confirmDelete() {
    const modal = document.getElementById('deleteModal');
    if (modal) modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) modal.style.display = 'none';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
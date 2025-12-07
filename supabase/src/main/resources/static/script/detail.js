const API_URL = 'http://localhost:8080/api';

let currentTodo = null;
let currentAccount = null;
let originalTodoData = null; // To track changes for cancel
let hasUnsavedChanges = false;

// Check session and load todo on page load
window.addEventListener('DOMContentLoaded', async () => {
    await checkSessionAndLoadTodo();
    setupFormListeners();
    setupBeforeUnload();
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
    const saveBtn = document.getElementById('saveBtn');

    titleInput.addEventListener('input', checkForChanges);
    noteInput.addEventListener('input', checkForChanges);
    completedInput.addEventListener('change', checkForChanges);

    // Enable/disable save button based on validation
    titleInput.addEventListener('input', validateForm);
}

// Validate form and update save button
function validateForm() {
    const titleInput = document.getElementById('todoTitle');
    const titleError = document.getElementById('titleError');
    const saveBtn = document.getElementById('saveBtn');

    if (titleInput.value.trim() === '') {
        titleError.textContent = 'Title is required';
        saveBtn.disabled = true;
        return false;
    } else {
        titleError.textContent = '';
        saveBtn.disabled = !hasUnsavedChanges;
        return true;
    }
}

// Check if form has changed
function checkForChanges() {
    if (!currentTodo || !originalTodoData) return;

    const titleInput = document.getElementById('todoTitle');
    const noteInput = document.getElementById('todoNote');
    const completedInput = document.getElementById('todoCompleted');

    const titleChanged = titleInput.value !== originalTodoData.title;
    const noteChanged = noteInput.value !== (originalTodoData.note || '');
    const completedChanged = completedInput.checked !== originalTodoData.completed;

    hasUnsavedChanges = titleChanged || noteChanged || completedChanged;

    // Update save button
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = !hasUnsavedChanges || !validateForm();

    return hasUnsavedChanges;
}

async function checkSessionAndLoadTodo() {
    try {
        // Check session first
        const sessionResponse = await fetch(`${API_URL}/accounts/me`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!sessionResponse.ok) {
            // Not logged in, redirect to home
            window.location.href = 'index.html';
            return;
        }

        currentAccount = await sessionResponse.json();

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
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Todo not found');
        }

        currentTodo = await response.json();
        originalTodoData = { ...currentTodo }; // Store original for comparison
        renderTodoForm();

    } catch (error) {
        showMessage('detailMessage', 'Failed to load todo details', true);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

function renderTodoForm() {
    // Fill form fields
    document.getElementById('todoTitle').value = currentTodo.title;
    document.getElementById('todoNote').value = currentTodo.note || '';
    document.getElementById('todoCompleted').checked = currentTodo.completed;
    document.getElementById('todoId').value = currentTodo.id;

    // Format dates
    if (currentTodo.createdAt) {
        document.getElementById('createdDate').textContent = formatDate(currentTodo.createdAt);
    }
    if (currentTodo.updatedAt) {
        document.getElementById('updatedDate').textContent = formatDate(currentTodo.updatedAt);
    }

    // Set initial save button state
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    hasUnsavedChanges = false;

    // Validate form
    validateForm();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function showMessage(elementId, message, isError = false) {
    const el = document.getElementById(elementId);
    el.innerHTML = `<div class="${isError ? 'error' : 'success'}">${message}</div>`;
    el.style.display = 'block';

    // Auto-hide after 4 seconds
    setTimeout(() => {
        el.style.display = 'none';
        el.innerHTML = '';
    }, 4000);
}

// SAVE TODO
async function saveTodo() {
    // Validate first
    if (!validateForm()) {
        showMessage('detailMessage', 'Please fix validation errors', true);
        return;
    }

    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.innerHTML;

    try {
        // Show loading state
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
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTodo)
        });

        if (response.ok) {
            const updatedData = await response.json();

            // Update current todo and original data
            currentTodo = updatedData;
            originalTodoData = { ...currentTodo };
            hasUnsavedChanges = false;

            // Update dates if provided
            if (updatedData.updatedAt) {
                document.getElementById('updatedDate').textContent = formatDate(updatedData.updatedAt);
            }

            showMessage('detailMessage', 'Todo saved successfully! ✓');

            // Reset save button
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

// CANCEL EDIT
function cancelEdit() {
    if (hasUnsavedChanges) {
        if (!confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            return;
        }
    }

    // Restore original values
    if (originalTodoData) {
        document.getElementById('todoTitle').value = originalTodoData.title;
        document.getElementById('todoNote').value = originalTodoData.note || '';
        document.getElementById('todoCompleted').checked = originalTodoData.completed;

        hasUnsavedChanges = false;
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.disabled = true;

        validateForm();
        showMessage('detailMessage', 'Changes discarded', false);
    }

    // If no changes, go back to list
    if (!hasUnsavedChanges) {
        window.location.href = 'index.html';
    }
}

// DELETE TODO with confirmation modal
function confirmDelete() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'none';
}
//delete
async function deleteTodo() {
    closeModal();

    try {
        const deleteBtn = document.querySelector('.btn-delete');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '⏳ Deleting...';
        deleteBtn.disabled = true;

        const response = await fetch(`${API_URL}/todos/${currentTodo.id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showMessage('detailMessage', 'Todo deleted successfully! Redirecting...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            const errorText = await response.text();
            showMessage('detailMessage', `Failed to delete: ${errorText || 'Unknown error'}`, true);
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        }

    } catch (error) {
        console.error('Delete error:', error);
        showMessage('detailMessage', 'Network error. Please try again.', true);
        const deleteBtn = document.querySelector('.btn-delete');
        deleteBtn.innerHTML = '🗑️ Delete Todo';
        deleteBtn.disabled = false;
    }
    // Close modal when clicking outside
    document.getElementById('editModal').addEventListener('click', (e) => {
        if (e.target.id === 'editModal') {
            closeModal();
        }
    });

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add these missing HTML elements to your page for the new features:
// 1. Add error span: <div class="error-message" id="titleError"></div>
// 2. Add metadata display (optional but nice)
// 3. Add delete confirmation modal (see previous HTML)
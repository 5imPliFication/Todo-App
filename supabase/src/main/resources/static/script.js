const apiUrl = "http://localhost:8080/api/todos";

async function loadTodos() {
    const container = document.getElementById("todos-container");
    container.innerHTML = "Loading...";

    const res = await fetch(apiUrl);
    const data = await res.json();

    container.innerHTML = "";

    data.forEach(todo => {
        const div = document.createElement("div");
        div.classList.add("todo-item");
        div.innerHTML = `
            <h2>${todo.title}</h2>
            <p>${todo.note}</p>
            <small>Completed: ${todo.completed}</small>
        `;
        container.appendChild(div);
    });
}

loadTodos();

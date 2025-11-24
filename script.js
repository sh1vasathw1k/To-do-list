let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

document.getElementById("taskInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("history", JSON.stringify(history));
}

function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    const taskLeft = document.createElement("div");
    taskLeft.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.onchange = () => toggleComplete(index);

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    taskLeft.appendChild(checkbox);
    taskLeft.appendChild(taskText);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = () => editTask(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteTask(index);

    li.appendChild(taskLeft);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (text === "") return;

  tasks.push({ text, completed: false });
  input.value = "";
  saveData();
  renderTasks();
}

function deleteTask(index) {
  const now = new Date();
  const dateStr = now.toLocaleString();

  history.push({
    text: tasks[index].text,
    deletedOn: dateStr
  });

  tasks.splice(index, 1);
  saveData();
  renderTasks();
}

function toggleComplete(index) {
  const task = tasks[index];
  task.completed = !task.completed;

  saveData();
  renderTasks();
}

function editTask(index) {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    saveData();
    renderTasks();
  }
}

function clearHistory() {
  if (confirm("Are you sure you want to clear all deleted tasks?")) {
    history = [];
    saveData();
  }
}

renderTasks();

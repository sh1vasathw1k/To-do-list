// Load tasks + history
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

// Save everything
function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("history", JSON.stringify(history));
}

// Render tasks on screen
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

// Add a task
function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (text === "") return;

  document.getElementById("taskInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});


  tasks.push({ text, completed: false });
  input.value = "";
  saveData();
  renderTasks();
}

// DELETE moves task → history
function deleteTask(index) {
  const now = new Date();
  const dateStr = now.toLocaleString();

  // Push deleted task info into history
  history.push({
    text: tasks[index].text,
    deletedOn: dateStr
  });

  // Remove the task from the list
  tasks.splice(index, 1);
  saveData();
  renderTasks();
}

// CHECKMARK just toggles completion (does NOT remove, does NOT save to history)
function toggleComplete(index) {
  const task = tasks[index];
  task.completed = !task.completed;

  // No history, no deletion — just toggle
  saveData();
  renderTasks();
}

// Edit task
function editTask(index) {
  const newText = prompt("Edit your task:", tasks[index].text);
  if (newText !== null && newText.trim() !== "") {
    tasks[index].text = newText.trim();
    saveData();
    renderTasks();
  }
}

// Clear history
function clearHistory() {
  if (confirm("Are you sure you want to clear all deleted tasks?")) {
    history = [];
    saveData();
  }
}

// Initial render
renderTasks();


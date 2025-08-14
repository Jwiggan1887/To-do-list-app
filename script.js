const datePicker = document.getElementById("datePicker");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

let currentDate = new Date().toISOString().split('T')[0];
datePicker.value = currentDate;

function getTasks(date) {
  const data = localStorage.getItem(`todo-${date}`);
  return data ? JSON.parse(data) : [];
}

function saveTasks(date, tasks) {
  localStorage.setItem(`todo-${date}`, JSON.stringify(tasks));
}

function loadTasks(date) {
  taskList.innerHTML = "";
  const tasks = getTasks(date);

  tasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.setAttribute("draggable", "true");
    li.dataset.index = index;
    li.className = task.checked ? "checked" : "";

    const taskText = document.createElement("span");
    taskText.textContent = task.time ? `${task.time} - ${task.text}` : task.text;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.checked;
    checkbox.onchange = () => toggleCheck(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.onclick = () => deleteTask(index);

    const subtaskToggle = document.createElement("button");
    subtaskToggle.textContent = task.showSubtasks ? "▾" : "▸";
    subtaskToggle.className = "toggle-subtasks";
    subtaskToggle.onclick = () => {
      task.showSubtasks = !task.showSubtasks;
      saveTasks(datePicker.value, tasks);
      loadTasks(datePicker.value);
    };

    const subtaskList = document.createElement("ul");
    subtaskList.className = "subtask-list";
    if (!task.showSubtasks) subtaskList.classList.add("collapsed");

    if (task.subtasks) {
      task.subtasks.forEach((sub, subIndex) => {
        const subLi = document.createElement("li");
        const subCheckbox = document.createElement("input");
        subCheckbox.type = "checkbox";
        subCheckbox.checked = sub.checked;
        subCheckbox.onchange = () => toggleSubCheck(index, subIndex);

        const subText = document.createElement("span");
        subText.textContent = sub.text;

        const subDeleteBtn = document.createElement("button");
        subDeleteBtn.textContent = "❌";
        subDeleteBtn.onclick = () => deleteSubtask(index, subIndex);

        subLi.appendChild(subCheckbox);
        subLi.appendChild(subText);
        subLi.appendChild(subDeleteBtn);

        subtaskList.appendChild(subLi);
      });
    }

    const subInput = document.createElement("input");
    subInput.type = "text";
    subInput.placeholder = "Add subtask";
    subInput.onkeydown = (e) => addSubtask(e, index);

    subtaskList.appendChild(subInput);

    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(deleteBtn);
    li.appendChild(subtaskToggle);
    li.appendChild(subtaskList);

    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    taskList.appendChild(li);
  });
}

function addTask() {
  const text = taskInput.value.trim();
  const time = document.getElementById("taskTime").value;
  if (!text) return;

  const tasks = getTasks(datePicker.value);
  tasks.push({ text, time, checked: false, subtasks: [], showSubtasks: true });
  saveTasks(datePicker.value, tasks);
  taskInput.value = "";
  document.getElementById("taskTime").value = "";
  loadTasks(datePicker.value);
}

function addSubtask(e, parentIndex) {
  if (e.key === "Enter") {
    const value = e.target.value.trim();
    if (!value) return;

    const tasks = getTasks(datePicker.value);
    if (!tasks[parentIndex].subtasks) tasks[parentIndex].subtasks = [];
    tasks[parentIndex].subtasks.push({ text: value, checked: false });
    saveTasks(datePicker.value, tasks);
    loadTasks(datePicker.value);
  }
}

function toggleCheck(index) {
  const tasks = getTasks(datePicker.value);
  tasks[index].checked = !tasks[index].checked;
  saveTasks(datePicker.value, tasks);
  loadTasks(datePicker.value);
}

function toggleSubCheck(index, subIndex) {
  const tasks = getTasks(datePicker.value);
  tasks[index].subtasks[subIndex].checked = !tasks[index].subtasks[subIndex].checked;
  saveTasks(datePicker.value, tasks);
  loadTasks(datePicker.value);
}

function deleteSubtask(index, subIndex) {
  const tasks = getTasks(datePicker.value);
  tasks[index].subtasks.splice(subIndex, 1);
  saveTasks(datePicker.value, tasks);
  loadTasks(datePicker.value);
}

function deleteTask(index) {
  const tasks = getTasks(datePicker.value);
  tasks.splice(index, 1);
  saveTasks(datePicker.value, tasks);
  loadTasks(datePicker.value);
}

let dragStartIndex;
function handleDragStart(e) {
  dragStartIndex = +this.dataset.index;
  this.style.opacity = "0.4";
}

function handleDragOver(e) {
  e.preventDefault();
  this.style.border = "2px dashed #00f";
}

function handleDrop() {
  const dragEndIndex = +this.dataset.index;
  swapTasks(dragStartIndex, dragEndIndex);
  this.style.border = "none";
  loadTasks(datePicker.value);
}

function handleDragEnd() {
  this.style.opacity = "1";
  this.style.border = "none";
}

function swapTasks(fromIndex, toIndex) {
  const tasks = getTasks(datePicker.value);
  const temp = tasks[fromIndex];
  tasks[fromIndex] = tasks[toIndex];
  tasks[toIndex] = temp;
  saveTasks(datePicker.value, tasks);
}

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    addTask();
  }
});

datePicker.addEventListener("change", () => {
  currentDate = datePicker.value;
  loadTasks(currentDate);
});

loadTasks(currentDate);

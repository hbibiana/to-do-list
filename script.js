/*INITIAL STATE*/
let tasks = [
  { id: 1, text: "Go for a walk", done: false },
  { id: 2, text: "Buy groceries", done: true }
];

let currentFilter = "all";
let currentLang = "en";

/*LOAD DATA FROM LOCALSTORAGE */
const savedTasks = localStorage.getItem("newTasks");
if (savedTasks) {
  tasks = JSON.parse(savedTasks);
}

/*DOM ELEMENTS */
const taskList = document.getElementById("task-list");
const taskCounter = document.getElementById("counter");
const todoListContainer = document.querySelector(".todolist");
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");

/*TRANSLATIONS*/
const translations = {
  sk: {
    namePlaceholder: "Napíš úlohu...",
    addTask: "Pridať úlohu",
    filterAll: "Všetky",
    filterDone: "Hotové",
    filterTodo: "Čakajúce",
    taskCounter: "Hotové úlohy: {doneCount} / {total}"
  },

  en: {
    namePlaceholder: "Type a task...",
    addTask: "Add task",
    filterAll: "All",
    filterDone: "Done",
    filterTodo: "To do",
    taskCounter: "Completed tasks: {doneCount} / {total}"
  }
};

function setLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    el.textContent = translations[lang][key] ?? el.textContent;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = translations[lang][key] ?? el.placeholder;
  });

  currentLang = lang;
  updateCounter();
  localStorage.setItem("lang", lang);

  if (lang === 'sk') {
    taskInput.setCustomValidity(""); 
    taskInput.oninvalid = () => taskInput.setCustomValidity("Prosím, vyplňte túto úlohu.");
  } else {
    taskInput.setCustomValidity(""); 
    taskInput.oninvalid = () => taskInput.setCustomValidity("Please fill out this field.");
  }
    taskInput.oninput = () => taskInput.setCustomValidity("");
}

document.getElementById("lang-sk").addEventListener("click", () => setLanguage("sk"));
document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));

const savedLang = localStorage.getItem("lang") || "en";
setLanguage(savedLang);


/*FETCH API FONTS */
async function initFontSelector() {
  const fontSelect = document.getElementById("font-select");
  if (!fontSelect) return;

  try {
    const response = await fetch('./fonts.json');
    if (!response.ok) throw new Error("Chyba pri načítaní JSON súboru");
    
    const fonts = await response.json();

    fontSelect.innerHTML = "";
    fonts.forEach(font => {
      const option = document.createElement("option");
      option.value = font.family;
      option.textContent = font.name;
      fontSelect.appendChild(option);
    });

    const savedFont = localStorage.getItem("selectedFont");
    if (savedFont) {
    
      document.body.style.fontFamily = savedFont;
      fontSelect.value = savedFont;
    }

  
    fontSelect.addEventListener("change", () => {
      const selectedFont = fontSelect.value;
      
      document.body.style.fontFamily = selectedFont;
    
      localStorage.setItem("selectedFont", selectedFont);
    });

  } catch (error) {
    console.error("Nepodarilo sa načítať fonty:", error);
  }
}

initFontSelector();

/*HELPER FUNCTIONS*/ 
function saveTasks() {
  localStorage.setItem("newTasks", JSON.stringify(tasks));
}

function getTasksToRender() {
  if (currentFilter === "done") return tasks.filter((t) => t.done);
  if (currentFilter === "todo") return tasks.filter((t) => !t.done);
  return tasks;
}

function updateCounter() {
  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const template = translations[currentLang].taskCounter;

  taskCounter.textContent = template
    .replace("{doneCount}", doneCount)
    .replace("{total}", total);
}

function addTask(text) {
  tasks.push({
    id: Date.now(),
    text: text,
    done: false
  });

  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function setTaskDone(id, isDone) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  task.done = isDone;
  saveTasks();
  render();
}

function editTask(id, newText) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const trimmedText = newText.trim();
  if (trimmedText === "") return;

  task.text = trimmedText;
  saveTasks();
  render();
}

function setFilter(filter) {
  currentFilter = filter;
  todoListContainer.classList.add("show");
  render();
}

/*RENDER FUNCTION*/
function render() {
  taskList.innerHTML = "";

  const tasksToRender = getTasksToRender();

  tasksToRender.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.classList.add(task.done ? "done" : "todo");
    taskItem.dataset.id = task.id;

    const taskCheckbox = document.createElement("input");
    taskCheckbox.type = "checkbox";
    taskCheckbox.checked = task.done;
    taskCheckbox.classList.add("task-checkbox");
    taskCheckbox.setAttribute("aria-label", `Mark task "${task.text}" as completed`);

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.classList.add("task-text");

    const editButton = document.createElement("button");
    editButton.type="button";
    editButton.innerHTML='<i class="fa-solid fa-pen-to-square"></i>';
    editButton.classList.add("edit-btn");
    editButton.setAttribute("aria-label", "Edit task");

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteButton.classList.add("delete-btn");
    deleteButton.setAttribute("aria-label", "Delete task");

    taskItem.appendChild(taskCheckbox);
    taskItem.appendChild(taskText);
    taskItem.appendChild(editButton);
    taskItem.appendChild(deleteButton);
    taskList.appendChild(taskItem);
  });

  updateCounter();

  const filtersNav = document.querySelector(".filters");
  if (tasks.length > 0) {
    todoListContainer.classList.add("show");
    filtersNav.classList.add("show");
  
  document.querySelectorAll(".filterBtn").forEach(btn => 
    btn.classList.remove("active"));

  const currentBtn = document.getElementById(currentFilter);
  if (currentBtn) currentBtn.classList.add("active");

  } else {
    todoListContainer.classList.remove("show");
    filtersNav.classList.remove("show");

  document.querySelectorAll(".filterBtn").forEach(btn => {
      btn.classList.remove("active");
    });
  }
}

/*EVENT LISTENERS*/
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const value = taskInput.value.trim();
  if (value === "") return;

  addTask(value);
  taskForm.reset();
});

taskList.addEventListener("change", (event) => {
  const taskCheckbox = event.target.closest(".task-checkbox");
  if (!taskCheckbox) return;

  const item = taskCheckbox.closest("li");
  if (!item) return;

  const id = Number(item.dataset.id);
  if (!id) return;

  setTaskDone(id, taskCheckbox.checked);
});


taskList.addEventListener("click", (event) => {
  if (event.target.classList.contains("edit-input")) return;
  const item = event.target.closest("li");
  if (!item) return;

  const id = Number(item.dataset.id);
  if (!id) return;

  if (event.target.closest(".delete-btn")) {
    deleteTask(id);
    return;
  }

  if (event.target.closest(".edit-btn")) {
    const taskText = item.querySelector(".task-text");
    const task = tasks.find((t) => t.id === id);
    if (!task || !taskText) return;

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.name="text";
    editInput.value = task.text;
    editInput.classList.add("edit-input");
    
    editInput.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    taskText.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    const saveEdit = () => {
      const newText = editInput.value.trim();
      if (newText === "" || newText === task.text) {
        render(); 
        return;
      }
      editTask(id, newText);
    };

  editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        editInput.removeEventListener("blur", saveEdit);
        saveEdit();
      }
      if (e.key === "Escape") render();
    });

    editInput.addEventListener("blur", saveEdit);
    return; 
  }

  if (event.target.classList.contains("task-checkbox")) {
    return;
  }

  const checkbox = item.querySelector(".task-checkbox");
  if (checkbox) {
    setTaskDone(id, !checkbox.checked);
  }
});

document.getElementById("all").addEventListener("click", () => setFilter("all"));
document.getElementById("done").addEventListener("click", () => setFilter("done"));
document.getElementById("todo").addEventListener("click", () => setFilter("todo"));

render();
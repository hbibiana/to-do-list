let tasks = [
  { id: 1, text: "Spraviť nákup", done: false },
  { id: 2, text: "Prejsť sa", done: true }
];

let currentFilter = "all"; 


const list = document.getElementById("task-list");
const counter = document.getElementById("counter");
const todoListBox = document.querySelector(".todolist"); 
const form = document.getElementById("task-form");
const input = document.getElementById("task-input");



function getTasksToRender() { 
  if (currentFilter === "done") return tasks.filter(t => t.done); 
  if (currentFilter === "todo") return tasks.filter(t => !t.done); 
  return tasks; 
}

function updateCounter() {
  const doneCount = tasks.filter(t => t.done).length;
  counter.textContent = `Dokončené úlohy: ${doneCount} / ${tasks.length}`;
}



function render() { 
    
  list.innerHTML = ""; 
   
  const tasksToRender = getTasksToRender(); 

  tasksToRender.forEach((task) => { 
    const li = document.createElement("li"); 
    li.classList.add(task.done ? "done" : "todo"); 

    // checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done; 

    // label
    const label = document.createElement("label");
    label.textContent = task.text; 

    // delete button 
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "x";
    
 
    deleteBtn.addEventListener("click", () => {
    tasks = tasks.filter(t => t.id !== task.id); 
    render(); 
    });


    checkbox.addEventListener("change", () => {
     
      const found = tasks.find(t => t.id === task.id); 
      if (!found) return; 

      found.done = checkbox.checked;

      render();
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(deleteBtn);
    list.appendChild(li);
    
  });

  updateCounter(); 
}



form.addEventListener("submit", (e) => { 
  e.preventDefault(); 

  const value = input.value.trim(); 
  if (value === "") return; 

  tasks.push({ id: Date.now(), text: value, done: false}); 
  

  form.reset(); 
  render();
});



document.getElementById("all").addEventListener("click", () => {
  currentFilter = "all";
  todoListBox.classList.add("show"); 
  render();
});

document.getElementById("done").addEventListener("click", () => { 
  currentFilter = "done";
  todoListBox.classList.add("show");
  render();
});

document.getElementById("todo").addEventListener("click", () => { 
  currentFilter = "todo";
  todoListBox.classList.add("show");
  render();
});



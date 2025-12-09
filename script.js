// DOM Elements
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionCountEl = document.getElementById('sessionCount');
const tabs = document.querySelectorAll('.tab');

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');

// Timer variables
let timer = null;
let totalSeconds = 25*60;
let remainingSeconds = totalSeconds;
let completedSessions = 0;

// Modes
const modes = {
    pomodoro: 0.1*60,
    short: 5*60,
    long: 15*60
};
let currentMode = 'pomodoro';

// Update timer display
function updateTimer() {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    timerEl.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

// Timer functions
function startTimer() {
if(timer) return;
timer = setInterval(()=>{
remainingSeconds--;
updateTimer();

    if(remainingSeconds <= 0){
        clearInterval(timer);
        timer = null;
        completedSessions++;
        sessionCountEl.textContent = completedSessions;
        alert('Session completed!');

        // Dodanie klasy time-completed tylko jeśli aktualny tryb to pomodoro
         if(currentMode === 'pomodoro'){
                Array.from(taskList.children).forEach(li => {
                    const checkbox = li.querySelector('input[type="checkbox"]');
                    if(checkbox && checkbox.checked && !li.classList.contains('time-completed')){
                        li.classList.add('time-completed');
                    }
                });
            }

            remainingSeconds = totalSeconds;
            updateTimer();
            pauseBtn.textContent = 'PAUSE'; // przywraca przycisk do domyślnego stanu
        }
    },1000);
}
function pauseTimer() {
    if(timer){
        clearInterval(timer);
        timer = null;
    }
}
function resetTimer() {
    pauseTimer();
    remainingSeconds = totalSeconds;
    updateTimer();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', () => {
    if(timer){
        clearInterval(timer);
        timer = null;
        pauseBtn.textContent = 'RESUME';
    } else {
        startTimer();
        pauseBtn.textContent = 'PAUSE';
    }
});
resetBtn.addEventListener('click', resetTimer);

// Tabs
tabs.forEach(tab=>{
    tab.addEventListener('click', ()=>{
        tabs.forEach(t=>t.classList.remove('active'));
        tab.classList.add('active');
        currentMode = tab.dataset.mode;
        totalSeconds = modes[currentMode];
        remainingSeconds = totalSeconds;
        updateTimer();
    });
});

// Tasks
function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach(li=>{
        tasks.push({name: li.dataset.name, completed: li.querySelector('input[type=checkbox]').checked});
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')||'[]');
    tasks.forEach(task=>{
        addTask(task.name, task.completed);
    });
}

function addTask(name){
const li = document.createElement('li');
li.dataset.name = name;

// Checkbox
const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.addEventListener('change', saveTasks);

// Tekst zadania
const span = document.createElement('span');
span.textContent = name;

// EDIT button
const editBtn = document.createElement('button');
editBtn.classList.add('edit-btn');
editBtn.title = "Edit task";
editBtn.innerHTML = '<i class="fa-solid fa-edit"></i>';

editBtn.addEventListener('click', () => {
    // Jeśli już istnieje pole edycji, nie dodawaj kolejnego
    if(taskList.querySelector('.edit-container')) return;

    const editContainer = document.createElement('div');
    editContainer.classList.add('edit-container');

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = li.dataset.name;
    editInput.classList.add('edit-input');

    const saveBtn = document.createElement('button');
    saveBtn.classList.add('save-btn');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => {
        const newName = editInput.value.trim();
        if(newName !== ''){
            li.dataset.name = newName;
            span.textContent = newName;
            saveTasks();
            editContainer.remove();
        }
    });

    editContainer.appendChild(editInput);
    editContainer.appendChild(saveBtn);

    // Dodajemy nad li (przed nim w DOM)
    taskList.insertBefore(editContainer, li);

    editInput.focus();
});

// REMOVE button
const removeBtn = document.createElement('button');
removeBtn.classList.add('remove-btn');
removeBtn.title = "Remove task";
removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
removeBtn.addEventListener('click', ()=>{
    li.remove();
    saveTasks();
});

li.appendChild(checkbox);
li.appendChild(span);
li.appendChild(editBtn);
li.appendChild(removeBtn);

taskList.appendChild(li);
saveTasks();

}

addTaskBtn.addEventListener('click', ()=>{
    const name = taskInput.value.trim();
    if(name!==''){
        addTask(name);
        taskInput.value='';
    }
});

// Load tasks on start
loadTasks();
updateTimer();

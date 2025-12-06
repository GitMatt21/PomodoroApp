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
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let completedSessions = 0;

// Modes
const modes = {
    pomodoro: 25*60,
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
            remainingSeconds = totalSeconds;
            updateTimer();
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
pauseBtn.addEventListener('click', pauseTimer);
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

function addTask(name, completed=false){
const li = document.createElement('li');
li.dataset.name = name;

const checkbox = document.createElement('input');
checkbox.type = 'checkbox';
checkbox.checked = completed;

// Ustawienie klasy completed jeśli zadanie jest już wykonane
if(checkbox.checked) {
    li.classList.add('completed');
}

// Event listener zmieniający klasę completed przy kliknięciu
checkbox.addEventListener('change', ()=>{
    if(checkbox.checked){
        li.classList.add('completed');
    } else {
        li.classList.remove('completed');
    }
    saveTasks();
});

const span = document.createElement('span');
span.textContent = name;

const removeBtn = document.createElement('button');
removeBtn.textContent = 'Remove';
removeBtn.addEventListener('click', ()=>{
    li.remove();
    saveTasks();
});

li.appendChild(checkbox);
li.appendChild(span);
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

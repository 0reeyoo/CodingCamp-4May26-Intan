/**
 * Focus Dashboard Application
 * A minimal, clean dashboard with greeting, focus timer, tasks, and quick links
 */

// ===== Storage Keys =====
const STORAGE_KEYS = {
  tasks: 'dashboard_tasks',
  quickLinks: 'dashboard_quick_links',
  userName: 'dashboard_user_name',
  timerDuration: 'dashboard_timer_duration',
  darkMode: 'dashboard_dark_mode',
  taskSortMode: 'dashboard_task_sort'
};

// ===== App State =====
let appState = {
  timerInterval: null,
  timeRemaining: 25 * 60, // 25 minutes in seconds
  isRunning: false,
  timerDuration: 25, // minutes
  userName: '',
  darkMode: false,
  taskSortMode: 'newest'
};

// ===== DOM Elements =====
const currentTimeEl = document.getElementById('currentTime');
const currentDateEl = document.getElementById('currentDate');
const greetingTextEl = document.getElementById('greetingText');
const timerDisplayEl = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const taskInputEl = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskListEl = document.getElementById('taskList');
const linkNameEl = document.getElementById('linkName');
const linkUrlEl = document.getElementById('linkUrl');
const addLinkBtn = document.getElementById('addLinkBtn');
const quickLinksContainerEl = document.getElementById('quickLinksContainer');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const userNameInput = document.getElementById('userNameInput');
const timerDurationInput = document.getElementById('timerDurationInput');
const sortTasksSelect = document.getElementById('sortTasksSelect');

// ===== Load Initial Settings =====
function loadAppState() {
  appState.userName = localStorage.getItem(STORAGE_KEYS.userName) || '';
  appState.timerDuration = parseInt(localStorage.getItem(STORAGE_KEYS.timerDuration)) || 25;
  appState.darkMode = localStorage.getItem(STORAGE_KEYS.darkMode) === 'true';
  appState.taskSortMode = localStorage.getItem(STORAGE_KEYS.taskSortMode) || 'newest';
  
  // Apply dark mode
  if (appState.darkMode) {
    document.body.classList.add('dark-mode');
    themeToggleBtn.textContent = 'â˜€ï¸';
  }
  
  // Update UI
  userNameInput.value = appState.userName;
  timerDurationInput.value = appState.timerDuration;
  sortTasksSelect.value = appState.taskSortMode;
  
  // Update timer display
  appState.timeRemaining = appState.timerDuration * 60;
  updateTimerDisplay();
}

loadAppState();

// ===== Time and Greeting Functions =====

function updateTime() {
  const now = new Date();
  
  // Format time
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
  
  // Format date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', options);
  currentDateEl.textContent = dateStr;
  
  // Update greeting based on time
  updateGreeting(now.getHours());
}

function updateGreeting(hour) {
  let greeting = 'Good Evening';
  
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening';
  } else {
    greeting = 'Good Night';
  }
  
  // Add user name if available
  if (appState.userName) {
    greeting += ', ' + appState.userName;
  }
  
  greetingTextEl.textContent = greeting;
}

// Update time immediately and then every second
updateTime();
setInterval(updateTime, 1000);

// ===== Theme Toggle =====
function toggleDarkMode() {
  appState.darkMode = !appState.darkMode;
  document.body.classList.toggle('dark-mode');
  localStorage.setItem(STORAGE_KEYS.darkMode, appState.darkMode);
  themeToggleBtn.textContent = appState.darkMode ? 'â˜€ï¸' : 'ðŸŒ™';
}

themeToggleBtn.addEventListener('click', toggleDarkMode);

// ===== Settings Modal =====
function openSettings() {
  settingsModal.classList.add('active');
}

function closeSettings() {
  settingsModal.classList.remove('active');
}

function saveSettings() {
  const newName = userNameInput.value.trim();
  const newDuration = parseInt(timerDurationInput.value);
  
  if (newDuration < 1 || newDuration > 120) {
    alert('Duration must be between 1 and 120 minutes');
    return;
  }
  
  appState.userName = newName;
  appState.timerDuration = newDuration;
  
  localStorage.setItem(STORAGE_KEYS.userName, newName);
  localStorage.setItem(STORAGE_KEYS.timerDuration, newDuration);
  
  // Reset timer with new duration
  appState.timeRemaining = newDuration * 60;
  updateTimerDisplay();
  updateTime();
  
  closeSettings();
  alert('Settings saved successfully!');
}

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);
saveSettingsBtn.addEventListener('click', saveSettings);

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) {
    closeSettings();
  }
});

// ===== Timer Functions =====

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  timerDisplayEl.textContent = formatTime(appState.timeRemaining);
}

function startTimer() {
  if (appState.isRunning) return;
  
  appState.isRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  
  appState.timerInterval = setInterval(() => {
    if (appState.timeRemaining > 0) {
      appState.timeRemaining--;
      updateTimerDisplay();
    } else {
      stopTimer();
      alert('Focus time completed! Great job!');
    }
  }, 1000);
}

function stopTimer() {
  appState.isRunning = false;
  clearInterval(appState.timerInterval);
  appState.timerInterval = null;
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

function resetTimer() {
  stopTimer();
  appState.timeRemaining = appState.timerDuration * 60;
  updateTimerDisplay();
  startBtn.disabled = false;
  stopBtn.disabled = true;
}

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
stopBtn.disabled = true;

updateTimerDisplay();

// ===== Task Functions =====

function getTasks() {
  try {
    const tasks = localStorage.getItem(STORAGE_KEYS.tasks);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
}

function sortTasks(tasks) {
  const sortMode = appState.taskSortMode;
  let sorted = [...tasks];
  
  switch (sortMode) {
    case 'newest':
      sorted.sort((a, b) => (b.id || 0) - (a.id || 0));
      break;
    case 'oldest':
      sorted.sort((a, b) => (a.id || 0) - (b.id || 0));
      break;
    case 'alphabetical':
      sorted.sort((a, b) => a.text.localeCompare(b.text));
      break;
    case 'completed':
      sorted.sort((a, b) => a.completed - b.completed);
      break;
    default:
      break;
  }
  
  return sorted;
}

function renderTasks() {
  const tasks = getTasks();
  const sortedTasks = sortTasks(tasks);
  taskListEl.innerHTML = '';
  
  sortedTasks.forEach((task, displayIndex) => {
    const actualIndex = tasks.findIndex(t => t.id === task.id);
    
    const taskItem = document.createElement('li');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskComplete(actualIndex));
    
    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = task.text;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteTask(actualIndex));
    
    taskItem.appendChild(checkbox);
    taskItem.appendChild(label);
    taskItem.appendChild(deleteBtn);
    taskListEl.appendChild(taskItem);
  });
}

function taskExists(text) {
  const tasks = getTasks();
  return tasks.some(task => task.text.toLowerCase() === text.toLowerCase());
}

function addTask() {
  const text = taskInputEl.value.trim();
  if (!text) return;
  
  // Check for duplicate tasks
  if (taskExists(text)) {
    alert('This task already exists!');
    return;
  }
  
  const tasks = getTasks();
  const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id || 0)) + 1 : 1;
  tasks.push({ text, completed: false, id: newId });
  saveTasks(tasks);
  renderTasks();
  taskInputEl.value = '';
  taskInputEl.focus();
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

function toggleTaskComplete(index) {
  const tasks = getTasks();
  tasks[index].completed = !tasks[index].completed;
  saveTasks(tasks);
  renderTasks();
}

function changeSortMode(mode) {
  appState.taskSortMode = mode;
  localStorage.setItem(STORAGE_KEYS.taskSortMode, mode);
  renderTasks();
}

addTaskBtn.addEventListener('click', addTask);
taskInputEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

sortTasksSelect.addEventListener('change', (e) => {
  changeSortMode(e.target.value);
});

renderTasks();

// ===== Quick Links Functions =====

function getQuickLinks() {
  try {
    const links = localStorage.getItem(STORAGE_KEYS.quickLinks);
    return links ? JSON.parse(links) : [];
  } catch (error) {
    console.error('Error loading links:', error);
    return [];
  }
}

function saveQuickLinks(links) {
  try {
    localStorage.setItem(STORAGE_KEYS.quickLinks, JSON.stringify(links));
  } catch (error) {
    console.error('Error saving links:', error);
  }
}

function renderQuickLinks() {
  const links = getQuickLinks();
  quickLinksContainerEl.innerHTML = '';
  
  links.forEach((link, index) => {
    const linkBtn = document.createElement('a');
    linkBtn.href = link.url;
    linkBtn.target = '_blank';
    linkBtn.className = 'quick-link-btn';
    linkBtn.textContent = link.name;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'quick-link-delete';
    deleteBtn.textContent = 'Ã—';
    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      deleteQuickLink(index);
    });
    
    linkBtn.appendChild(deleteBtn);
    quickLinksContainerEl.appendChild(linkBtn);
  });
}

function addQuickLink() {
  const name = linkNameEl.value.trim();
  const url = linkUrlEl.value.trim();
  
  if (!name || !url) {
    alert('Please enter both link name and URL');
    return;
  }
  
  // Validate URL format
  try {
    new URL(url);
  } catch {
    alert('Please enter a valid URL');
    return;
  }
  
  const links = getQuickLinks();
  links.push({ name, url });
  saveQuickLinks(links);
  renderQuickLinks();
  linkNameEl.value = '';
  linkUrlEl.value = '';
  linkNameEl.focus();
}

function deleteQuickLink(index) {
  const links = getQuickLinks();
  links.splice(index, 1);
  saveQuickLinks(links);
  renderQuickLinks();
}

addLinkBtn.addEventListener('click', addQuickLink);
linkUrlEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addQuickLink();
});

renderQuickLinks();

import './style.css'
import { insforge } from './insforge.js'

/* ================================================================
   Theme System
   ================================================================ */
function getInitialTheme() {
  const stored = localStorage.getItem('taskflow-theme')
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

let currentTheme = getInitialTheme()

function applyTheme(theme) {
  currentTheme = theme
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('taskflow-theme', theme)
  updateToggleLabel()
}

function toggleTheme() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark')
}

function updateToggleLabel() {
  const label = document.querySelector('.toggle-label')
  if (label) {
    label.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode'
  }
}

function renderThemeToggle() {
  // Only render once — lives outside #app so it's never cleared
  if (document.getElementById('theme-toggle-wrapper')) return

  const wrapper = document.createElement('div')
  wrapper.className = 'theme-toggle-wrapper'
  wrapper.id = 'theme-toggle-wrapper'
  wrapper.innerHTML = `
    <button class="theme-toggle-btn" id="btn-theme-toggle" type="button" aria-label="Toggle theme">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor" stroke-linecap="round">
        <defs>
          <clipPath id="theme-clip">
            <path d="M0-5h30a1 1 0 009 13v24H0Z" class="moon-mask"/>
          </clipPath>
        </defs>
        <g clip-path="url(#theme-clip)">
          <circle class="sun-core" cx="16" cy="16" r="8"/>
          <g class="sun-rays" stroke="currentColor" stroke-width="1.5" fill="none">
            <path d="M16 5.5v-4"/>
            <path d="M16 30.5v-4"/>
            <path d="M1.5 16h4"/>
            <path d="M26.5 16h4"/>
            <path d="m23.4 8.6 2.8-2.8"/>
            <path d="m5.7 26.3 2.9-2.9"/>
            <path d="m5.8 5.8 2.8 2.8"/>
            <path d="m23.4 23.4 2.9 2.9"/>
          </g>
        </g>
      </svg>
      <span class="toggle-label">${currentTheme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
    </button>`

  document.body.appendChild(wrapper)

  document.getElementById('btn-theme-toggle')
    .addEventListener('click', toggleTheme)
}

// Apply theme immediately (before paint)
applyTheme(currentTheme)

/* ================================================================
   State
   ================================================================ */
let currentUser = null
let todos = []
let filter = 'all' // 'all' | 'active' | 'completed'
let isLoading = true

// Billing & Subscription State
let userEntitlement = null
let showPremiumModal = false
let showManageBillingModal = false

// Form Details & AI Chatbot State
let isDetailsOpen = false
let isChatOpen = false
let chatMessages = [
  { sender: 'bot', text: "Hi! I'm your Taskflow AI Assistant. How can I help you today? You can ask me to list your tasks, add a task, or set alarms!" }
]
let isBotTyping = false
const activeAlarms = new Map()

const GEMINI_API_KEY = ''

const app = document.getElementById('app')

/* ================================================================
   Alarm & Notification System
   ================================================================ */
function formatAlarmTime(date) {
  const now = new Date()
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear()
                  
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) {
    return `Today at ${timeStr}`
  }
  
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  return `${dateStr}, ${timeStr}`
}

function scheduleAlarm(todo) {
  if (todo.completed || !todo.alarm_at) {
    cancelAlarm(todo.id)
    return
  }
  
  const alarmTime = new Date(todo.alarm_at).getTime()
  const now = Date.now()
  
  cancelAlarm(todo.id)
  
  if (alarmTime <= now) {
    return
  }
  
  const delay = alarmTime - now
  const timerId = setTimeout(() => {
    triggerAlarm(todo)
  }, delay)
  
  activeAlarms.set(todo.id, timerId)
}

function cancelAlarm(todoId) {
  if (activeAlarms.has(todoId)) {
    clearTimeout(activeAlarms.get(todoId))
    activeAlarms.delete(todoId)
  }
}

function syncAllAlarms() {
  for (const timerId of activeAlarms.values()) {
    clearTimeout(timerId)
  }
  activeAlarms.clear()
  
  todos.forEach(todo => {
    if (!todo.completed && todo.alarm_at) {
      scheduleAlarm(todo)
    }
  })
}

function triggerAlarm(todo) {
  showToast('Alarm Ringing', todo.title, todo.id)
  
  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      new Notification('Taskflow Alarm', {
        body: todo.title,
        icon: '/vite.svg'
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Taskflow Alarm', {
            body: todo.title,
            icon: '/vite.svg'
          })
        }
      })
    }
  }
  
  const itemEl = document.querySelector(`.todo-item[data-id="${todo.id}"]`)
  if (itemEl) {
    const badge = itemEl.querySelector('.alarm-badge')
    if (badge) {
      badge.classList.add('ringing')
    }
  }
}

function showToast(title, message, todoId) {
  let container = document.querySelector('.toast-container')
  if (!container) {
    container = document.createElement('div')
    container.className = 'toast-container'
    document.body.appendChild(container)
  }
  
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.innerHTML = `
    <div class="toast-icon alarm">⏰</div>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" type="button">&times;</button>
  `
  
  container.appendChild(toast)
  
  const closeBtn = toast.querySelector('.toast-close')
  const dismiss = () => {
    if (toast.classList.contains('removing')) return
    toast.classList.add('removing')
    toast.addEventListener('animationend', () => {
      toast.remove()
      if (container.children.length === 0) {
        container.remove()
      }
    })
  }
  
  closeBtn.addEventListener('click', dismiss)
  setTimeout(dismiss, 7000)
}

/* ================================================================
   SVG Icons
   ================================================================ */
const icons = {
  logo: `<svg viewBox="0 0 24 24" fill="white"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="white" fill="none" stroke-width="1.5" stroke-linecap="round"/><path d="M9 14l2 2 4-4" stroke="white" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  google: `<svg viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  trash: `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>`,
  empty: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 15h8M9 9h.01M15 9h.01"></path></svg>`,
  allDone: `<svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
}

/* ================================================================
   Rendering
   ================================================================ */
function render() {
  // Always render the theme toggle (lives outside #app)
  renderThemeToggle()

  if (isLoading) {
    app.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span class="loading-text">Loading…</span>
      </div>`
    return
  }

  if (!currentUser) {
    // If not logged in, clean up chatbot elements
    const toggle = document.getElementById('chat-toggle-wrapper')
    if (toggle) toggle.remove()
    const panel = document.getElementById('chat-panel')
    if (panel) panel.remove()
    isChatOpen = false

    renderLanding()
    return
  }

  renderApp()
  renderChatbot()

  if (showPremiumModal) {
    const modalWrapper = document.createElement('div')
    modalWrapper.innerHTML = renderPremiumModal()
    app.appendChild(modalWrapper.firstElementChild)
    attachModalEvents()
  }

  if (showManageBillingModal) {
    const modalWrapper = document.createElement('div')
    modalWrapper.innerHTML = renderManageBillingModal()
    app.appendChild(modalWrapper.firstElementChild)
    attachBillingModalEvents()
  }
}

function renderLanding() {
  app.innerHTML = `
    <div class="landing">
      <div class="landing-logo">${icons.logo}</div>
      <h1>Taskflow</h1>
      <p>A beautifully simple way to organize your day. Sign in to get started.</p>
      <button id="btn-google-signin" class="btn-google">
        ${icons.google}
        <span>Continue with Google</span>
      </button>
    </div>`

  document.getElementById('btn-google-signin')
    .addEventListener('click', handleGoogleSignIn)
}

function renderApp() {
  const filtered = getFilteredTodos()
  const totalCount = todos.length
  const doneCount = todos.filter(t => t.completed).length
  const activeCount = totalCount - doneCount

  const userInitial = getUserInitial()
  const avatarUrl = currentUser?.profile?.avatar_url
  const isPremium = userEntitlement && userEntitlement.active

  app.innerHTML = `
    <header class="app-header">
      <div class="app-header-left">
        <h1 class="app-title">Taskflow</h1>
        ${isPremium ? `<span class="premium-badge">★ Premium</span>` : ''}
      </div>
      <div class="user-info">
        ${isPremium
          ? `<button id="btn-manage-billing" class="btn-manage-billing">Manage Billing</button>`
          : `<button id="btn-upgrade" class="btn-upgrade">Go Premium</button>`
        }
        <div class="user-avatar" id="user-avatar">
          ${avatarUrl
            ? `<img src="${avatarUrl}" alt="avatar" />`
            : userInitial}
        </div>
        <button id="btn-signout" class="btn-signout">Sign Out</button>
      </div>
    </header>

    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-number">${totalCount}</div>
        <div class="stat-label">Total</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${activeCount}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${doneCount}</div>
        <div class="stat-label">Done</div>
      </div>
    </div>

    <form id="add-todo-form" class="add-todo-form">
      <div class="add-todo-top-row">
        <input
          id="todo-input"
          class="add-todo-input"
          type="text"
          placeholder="What needs to be done?"
          autocomplete="off"
          maxlength="200"
        />
        <button class="btn-toggle-details ${isDetailsOpen ? 'open' : ''}" type="button" id="btn-toggle-details" aria-label="Toggle details">
          <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>
          <span>Details</span>
        </button>
        <button type="submit" class="btn-add" id="btn-add-todo">
          <span>Add</span>
        </button>
      </div>
      <div class="add-todo-details ${isDetailsOpen ? 'open' : ''}" id="add-todo-details">
        <div class="add-todo-details-inner">
          <textarea
            id="todo-description"
            class="add-todo-description"
            placeholder="Add description..."
            maxlength="1000"
          ></textarea>
          <div class="alarm-row">
            <label for="todo-alarm">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>Set alarm:</span>
            </label>
            <input
              id="todo-alarm"
              class="alarm-input"
              type="datetime-local"
            />
          </div>
        </div>
      </div>
    </form>

    <div class="filter-tabs">
      <button class="filter-tab ${filter === 'all' ? 'active' : ''}" data-filter="all">All</button>
      <button class="filter-tab ${filter === 'active' ? 'active' : ''}" data-filter="active">Active</button>
      <button class="filter-tab ${filter === 'completed' ? 'active' : ''}" data-filter="completed">Done</button>
    </div>

    <div class="todo-list" id="todo-list">
      ${filtered.length === 0
        ? renderEmptyState()
        : filtered.map((todo, i) => renderTodoItem(todo, i)).join('')}
    </div>`

  // Attach listeners
  document.getElementById('btn-signout')
    .addEventListener('click', handleSignOut)

  const upgradeBtn = document.getElementById('btn-upgrade')
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      showPremiumModal = true
      render()
    })
  }

  const manageBtn = document.getElementById('btn-manage-billing')
  if (manageBtn) {
    manageBtn.addEventListener('click', () => {
      showManageBillingModal = true
      render()
    })
  }

  document.getElementById('add-todo-form')
    .addEventListener('submit', handleAddTodo)

  const toggleDetailsBtn = document.getElementById('btn-toggle-details')
  if (toggleDetailsBtn) {
    toggleDetailsBtn.addEventListener('click', () => {
      isDetailsOpen = !isDetailsOpen
      const detailsEl = document.getElementById('add-todo-details')
      if (detailsEl) {
        detailsEl.classList.toggle('open', isDetailsOpen)
      }
      toggleDetailsBtn.classList.toggle('open', isDetailsOpen)
    })
  }

  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      filter = tab.dataset.filter
      render()
    })
  })

  document.querySelectorAll('.todo-checkbox input').forEach(cb => {
    cb.addEventListener('change', () => handleToggleTodo(cb.dataset.id))
  })

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteTodo(btn.dataset.id))
  })

  // Focus input
  const input = document.getElementById('todo-input')
  if (input) input.focus()
}

function renderTodoItem(todo, index) {
  const hasDesc = todo.description && todo.description.trim()
  const hasAlarm = todo.alarm_at
  
  let alarmHtml = ''
  if (hasAlarm) {
    const alarmTime = new Date(todo.alarm_at)
    const isPast = alarmTime.getTime() <= Date.now()
    const formatted = formatAlarmTime(alarmTime)
    const isRinging = activeAlarms.has(todo.id) && !todo.completed && (alarmTime.getTime() <= Date.now() + 1000)
    alarmHtml = `
      <div class="alarm-badge ${isPast ? 'past' : ''} ${isRinging ? 'ringing' : ''}" title="Alarm Time">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${formatted}</span>
      </div>`
  }

  return `
    <div class="todo-item ${todo.completed ? 'completed' : ''}" style="animation-delay: ${index * 40}ms" data-id="${todo.id}">
      <label class="todo-checkbox">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
        <span class="checkmark">${icons.check}</span>
      </label>
      <div class="todo-content">
        <span class="todo-title">${escapeHtml(todo.title)}</span>
        ${hasDesc ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
        ${hasAlarm ? `<div class="todo-meta">${alarmHtml}</div>` : ''}
      </div>
      <button class="btn-delete" data-id="${todo.id}" aria-label="Delete todo">
        ${icons.trash}
      </button>
    </div>`
}

function renderEmptyState() {
  if (filter === 'completed') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icons.empty}</div>
        <h3>No completed tasks</h3>
        <p>Complete a task and it will show up here.</p>
      </div>`
  }
  if (filter === 'active') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icons.allDone}</div>
        <h3>All caught up!</h3>
        <p>Every task is done. Well played.</p>
      </div>`
  }
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icons.logo}</div>
      <h3>No tasks yet</h3>
      <p>Add your first task to get started.</p>
    </div>`
}

/* ================================================================
   Auth Handlers
   ================================================================ */
async function handleGoogleSignIn() {
  await insforge.auth.signInWithOAuth('google', {
    redirectTo: window.location.origin,
    additionalParams: { prompt: 'select_account' },
  })
}

async function handleSignOut() {
  await insforge.auth.signOut()
  currentUser = null
  todos = []
  filter = 'all'
  render()
}

/* ================================================================
   Todo Handlers
   ================================================================ */
async function handleAddTodo(e) {
  e.preventDefault()
  const input = document.getElementById('todo-input')
  const title = input.value.trim()
  if (!title) return

  const isPremium = userEntitlement && userEntitlement.active
  if (todos.length >= 3 && !isPremium) {
    showPremiumModal = true
    render()
    return
  }

  const btn = document.getElementById('btn-add-todo')
  btn.disabled = true

  const descriptionInput = document.getElementById('todo-description')
  const description = descriptionInput ? descriptionInput.value.trim() : ''

  const alarmInput = document.getElementById('todo-alarm')
  let alarm_at = null
  if (alarmInput && alarmInput.value) {
    alarm_at = new Date(alarmInput.value).toISOString()
  }

  if (currentUser && currentUser.id === 'guest-user-id') {
    const newTodo = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      alarm_at,
      completed: false,
      created_at: new Date().toISOString()
    }
    todos.unshift(newTodo)
    localStorage.setItem('taskflow-todos', JSON.stringify(todos))
    
    // Clear inputs
    input.value = ''
    if (descriptionInput) descriptionInput.value = ''
    if (alarmInput) alarmInput.value = ''
    isDetailsOpen = false

    if (newTodo.alarm_at) {
      scheduleAlarm(newTodo)
    }
    render()
    return
  }

  const { data, error } = await insforge.database
    .from('todos')
    .insert([{ title, description, alarm_at }])
    .select()

  if (error) {
    console.error('Failed to add todo:', error.message)
    btn.disabled = false
    return
  }

  todos.unshift(data[0])
  
  // Clear inputs
  input.value = ''
  if (descriptionInput) descriptionInput.value = ''
  if (alarmInput) alarmInput.value = ''
  isDetailsOpen = false // reset details open state after adding

  // Setup alarm if set
  if (data[0].alarm_at) {
    scheduleAlarm(data[0])
  }

  render()
}

async function handleToggleTodo(id) {
  const todo = todos.find(t => t.id === id)
  if (!todo) return

  const newCompleted = !todo.completed

  // Optimistic update
  todo.completed = newCompleted
  if (newCompleted) {
    cancelAlarm(id)
  } else if (todo.alarm_at) {
    scheduleAlarm(todo)
  }
  render()

  if (currentUser && currentUser.id === 'guest-user-id') {
    localStorage.setItem('taskflow-todos', JSON.stringify(todos))
    return
  }

  const { error } = await insforge.database
    .from('todos')
    .update({ completed: newCompleted })
    .eq('id', id)

  if (error) {
    console.error('Failed to toggle todo:', error.message)
    todo.completed = !newCompleted
    if (todo.completed) {
      cancelAlarm(id)
    } else if (todo.alarm_at) {
      scheduleAlarm(todo)
    }
    render()
  }
}

async function handleDeleteTodo(id) {
  const item = document.querySelector(`.todo-item[data-id="${id}"]`)
  if (item) {
    item.classList.add('removing')
    await new Promise(r => setTimeout(r, 280))
  }

  cancelAlarm(id)

  const idx = todos.findIndex(t => t.id === id)
  const removed = todos.splice(idx, 1)[0]
  render()

  if (currentUser && currentUser.id === 'guest-user-id') {
    localStorage.setItem('taskflow-todos', JSON.stringify(todos))
    return
  }

  const { error } = await insforge.database
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete todo:', error.message)
    todos.splice(idx, 0, removed)
    if (removed.alarm_at) {
      scheduleAlarm(removed)
    }
    render()
  }
}

/* ================================================================
   Data Loading
   ================================================================ */
async function loadTodos() {
  if (currentUser && currentUser.id === 'guest-user-id') {
    const stored = localStorage.getItem('taskflow-todos')
    todos = stored ? JSON.parse(stored) : []
    return
  }

  const { data, error } = await insforge.database
    .from('todos')
    .select()
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load todos:', error.message)
    return
  }

  todos = data || []
}

/* ================================================================
   Helpers
   ================================================================ */
function getFilteredTodos() {
  if (filter === 'active') return todos.filter(t => !t.completed)
  if (filter === 'completed') return todos.filter(t => t.completed)
  return todos
}

function getUserInitial() {
  const name = currentUser?.profile?.name || currentUser?.email || '?'
  return name.charAt(0).toUpperCase()
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/* ================================================================
   AI Chatbot UI & logic
   ================================================================ */
function renderChatbot() {
  if (!currentUser) return

  if (document.getElementById('chat-toggle-wrapper')) {
    const panel = document.getElementById('chat-panel')
    const btn = document.getElementById('btn-chat-toggle')
    
    if (isChatOpen) {
      if (!panel) {
        createChatPanel()
      }
      if (btn) btn.classList.add('open')
    } else {
      if (panel) {
        panel.classList.add('closing')
        panel.addEventListener('animationend', () => {
          panel.remove()
        }, { once: true })
      }
      if (btn) btn.classList.remove('open')
    }
    return
  }

  const wrapper = document.createElement('div')
  wrapper.className = 'chat-toggle-wrapper'
  wrapper.id = 'chat-toggle-wrapper'
  wrapper.innerHTML = `
    <button class="chat-toggle-btn" id="btn-chat-toggle" type="button" aria-label="Toggle chat">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="chat-badge"></span>
    </button>
  `
  document.body.appendChild(wrapper)

  const toggleBtn = document.getElementById('btn-chat-toggle')
  toggleBtn.addEventListener('click', () => {
    isChatOpen = !isChatOpen
    renderChatbot()
  })
}

function createChatPanel() {
  if (!currentUser) return
  
  let panel = document.getElementById('chat-panel')
  if (panel) return

  panel = document.createElement('div')
  panel.className = 'chat-panel'
  panel.id = 'chat-panel'
  
  panel.innerHTML = `
    <div class="chat-header">
      <div class="chat-header-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v4"></path>
          <path d="M12 16h.01"></path>
        </svg>
      </div>
      <div class="chat-header-info">
        <div class="chat-header-title">Taskflow AI</div>
        <div class="chat-header-status">Online</div>
      </div>
      <button class="chat-header-close" id="btn-chat-close" type="button">&times;</button>
    </div>
    <div class="chat-messages" id="chat-messages-container"></div>
    <form class="chat-input-area" id="chat-input-form">
      <input
        type="text"
        class="chat-input"
        id="chat-input-field"
        placeholder="Ask AI or add a task..."
        autocomplete="off"
        required
      />
      <button class="btn-chat-send" id="btn-chat-send" type="submit">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  `
  document.body.appendChild(panel)

  document.getElementById('btn-chat-close').addEventListener('click', () => {
    isChatOpen = false
    renderChatbot()
  })

  document.getElementById('chat-input-form').addEventListener('submit', handleChatSubmit)

  renderChatMessages()
}

function renderChatMessages() {
  const container = document.getElementById('chat-messages-container')
  if (!container) return

  let html = chatMessages.map(msg => {
    const isBot = msg.sender === 'bot'
    return `
      <div class="chat-msg ${isBot ? 'bot' : 'user'}">
        <div class="chat-msg-avatar">${isBot ? 'AI' : 'U'}</div>
        <div class="chat-msg-bubble">${msg.text}</div>
      </div>
    `
  }).join('')

  if (isBotTyping) {
    html += `
      <div class="chat-msg bot" id="typing-msg">
        <div class="chat-msg-avatar">AI</div>
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `
  }

  container.innerHTML = html
  container.scrollTop = container.scrollHeight
}

async function handleChatSubmit(e) {
  e.preventDefault()
  const input = document.getElementById('chat-input-field')
  const text = input.value.trim()
  if (!text) return

  input.value = ''

  chatMessages.push({ sender: 'user', text })
  renderChatMessages()

  isBotTyping = true
  renderChatMessages()

  try {
    const reply = await callGeminiAPI(text)
    chatMessages.push({ sender: 'bot', text: reply })
  } catch (error) {
    console.error('Gemini call failed:', error)
    chatMessages.push({ sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' })
  } finally {
    isBotTyping = false
    renderChatMessages()
  }
}

async function callGeminiAPI(userMessage) {
  const now = new Date()
  const isPremium = userEntitlement && userEntitlement.active
  
  const systemInstruction = `You are the Taskflow AI Assistant, a smart and helpful task manager built directly into Taskflow.
You can help the user organize their life, summarize their tasks, and add tasks.

Core instructions:
- Be encouraging, concise, and helpful.
- Format your replies in nice markdown.
- If the user wants to add a task, you MUST extract the title, description (optional), and alarm time (optional).
- Free users are limited to 3 tasks. If the user is on the Free tier and already has 3 or more tasks, you must NOT add the task. Instead, explain the limit and encourage them to upgrade.

Current Context:
- Current Local Time: ${now.toString()}
- Current User Tier: ${isPremium ? 'Premium (Unlimited tasks)' : 'Free (Limit: 3 tasks)'}
- Current Tasks List (there are ${todos.length} tasks total):
${todos.map((t, idx) => `${idx + 1}. Title: "${t.title}" | Completed: ${t.completed} | Description: "${t.description || ''}" | Alarm: ${t.alarm_at ? t.alarm_at : 'None'}`).join('\n')}

Response Format:
You must respond ONLY with a valid JSON object matching this structure:
{
  "reply": "Your markdown-formatted text response to the user.",
  "action": {
    "type": "ADD_TODO",
    "title": "Extracted Title",
    "description": "Extracted Description (can be empty string)",
    "alarm_at": "ISO 8601 timestamp string for the alarm (e.g. 2026-06-20T18:00:00.000Z), or null if no alarm is requested"
  }
}

If the user is NOT requesting to add a task, set "action" to null or {"type": "NONE"}.
Do not include any extra text outside of the JSON object.`

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemInstruction}\n\nUser Message: "${userMessage}"` }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API responded with status ${response.status}`)
  }

  const result = await response.json()
  const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text
  
  if (!responseText) {
    throw new Error('Empty response from Gemini')
  }

  const parsed = JSON.parse(responseText)
  
  if (parsed.action && parsed.action.type === 'ADD_TODO') {
    const { title, description, alarm_at } = parsed.action
    if (title) {
      await executeAITaskAddition(title, description, alarm_at)
    }
  }

  return parsed.reply
}

async function executeAITaskAddition(title, description, alarm_at) {
  const isPremium = userEntitlement && userEntitlement.active
  if (todos.length >= 3 && !isPremium) {
    return
  }

  if (currentUser && currentUser.id === 'guest-user-id') {
    const newTodo = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      title,
      description: description || '',
      alarm_at,
      completed: false,
      created_at: new Date().toISOString()
    }
    todos.unshift(newTodo)
    localStorage.setItem('taskflow-todos', JSON.stringify(todos))
    
    if (newTodo.alarm_at) {
      scheduleAlarm(newTodo)
    }
    render()
    return
  }

  const { data, error } = await insforge.database
    .from('todos')
    .insert([{ title, description: description || '', alarm_at }])
    .select()

  if (error) {
    console.error('AI failed to add todo:', error.message)
    return
  }

  todos.unshift(data[0])
  
  if (data[0].alarm_at) {
    scheduleAlarm(data[0])
  }

  render()
}

/* ================================================================
   Billing and Modal Helpers
   ================================================================ */
async function loadEntitlement() {
  const { data, error } = await insforge.database
    .from('user_entitlements')
    .select()
    .eq('user_id', currentUser.id)
    .single()

  if (error) {
    userEntitlement = { plan: 'free', active: false }
  } else {
    userEntitlement = data || { plan: 'free', active: false }
  }
}

function loadScript(src) {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.head.appendChild(script)
  })
}

function renderPremiumModal() {
  return `
    <div class="modal-overlay" id="premium-modal-overlay">
      <div class="modal-content premium-modal">
        <button class="modal-close" id="btn-close-modal">&times;</button>
        <div class="premium-header">
          <div class="premium-icon">★</div>
          <h2>Unlock Premium</h2>
          <p class="premium-subtitle">Get unlimited tasks and unlock exclusive features.</p>
        </div>
        
        <div class="benefits-list">
          <div class="benefit-item">
            <span class="benefit-icon">✦</span>
            <div class="benefit-text">
              <h4>Unlimited Tasks</h4>
              <p>Add as many tasks as you need. No restrictions.</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🛡</span>
            <div class="benefit-text">
              <h4>Priority Support</h4>
              <p>Get quick responses to your queries and issues.</p>
            </div>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">⚡</span>
            <div class="benefit-text">
              <h4>Fast Syncing</h4>
              <p>Instant replication across all your active sessions.</p>
            </div>
          </div>
        </div>

        <div class="pricing-card">
          <div class="pricing-price">₹49<span class="pricing-period">/month</span></div>
          <p class="pricing-desc">Billed monthly. Cancel anytime.</p>
        </div>

        <div class="modal-actions">
          <button class="btn-checkout" id="btn-checkout-stripe">
            <span>Subscribe Now</span>
          </button>
          <button class="btn-demo-mode" id="btn-demo-mode">
            <span>Instant Demo Activation (Free)</span>
          </button>
        </div>
        <p class="modal-note">Checkout and billing system integration.</p>
      </div>
    </div>`
}

function renderManageBillingModal() {
  return `
    <div class="modal-overlay" id="billing-modal-overlay">
      <div class="modal-content billing-modal">
        <button class="modal-close" id="btn-close-billing-modal">&times;</button>
        <div class="premium-header">
          <div class="premium-icon">⚙</div>
          <h2>Manage Subscription</h2>
          <p class="premium-subtitle">Your subscription is active on the Premium tier.</p>
        </div>

        <div class="billing-details">
          <div class="detail-row">
            <span class="detail-label">Current Plan</span>
            <span class="detail-value premium-plan-text">Premium (₹49/month)</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Status</span>
            <span class="detail-value active-badge">Active</span>
          </div>
        </div>

        <div class="modal-actions vertical">
          <button class="btn-portal" id="btn-stripe-portal">
            <span>Stripe Customer Portal</span>
          </button>
          <button class="btn-downgrade" id="btn-demo-downgrade">
            <span>Downgrade to Free Tier (Demo)</span>
          </button>
        </div>
      </div>
    </div>`
}

function attachModalEvents() {
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    showPremiumModal = false
    render()
  })

  document.getElementById('premium-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'premium-modal-overlay') {
      showPremiumModal = false
      render()
    }
  })

  document.getElementById('btn-checkout-stripe').addEventListener('click', handleStripeCheckout)
  document.getElementById('btn-demo-mode').addEventListener('click', handleDemoActivation)
}

function attachBillingModalEvents() {
  document.getElementById('btn-close-billing-modal').addEventListener('click', () => {
    showManageBillingModal = false
    render()
  })

  document.getElementById('billing-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'billing-modal-overlay') {
      showManageBillingModal = false
      render()
    }
  })

  document.getElementById('btn-stripe-portal').addEventListener('click', handleStripePortal)
  document.getElementById('btn-demo-downgrade').addEventListener('click', handleDemoDowngrade)
}

async function handleStripeCheckout() {
  const btn = document.getElementById('btn-checkout-stripe')
  btn.disabled = true
  btn.innerHTML = `<span>Loading Checkout…</span>`

  try {
    const { data, error } = await insforge.payments.stripe.createCheckoutSession('test', {
      mode: 'subscription',
      lineItems: [{ priceId: 'price_premium_monthly', quantity: 1 }],
      successUrl: window.location.origin,
      cancelUrl: window.location.origin,
      subject: { type: 'user', id: currentUser.id },
      customerEmail: currentUser.email,
      idempotencyKey: `user:${currentUser.id}:premium-${Date.now()}`
    })

    if (error) {
      console.warn('Stripe checkout failed, trying Razorpay fallback...', error.message)
      
      const rzpRes = await insforge.payments.razorpay.createSubscription('test', {
        planId: 'plan_premium_monthly',
        totalCount: 12,
        subject: { type: 'user', id: currentUser.id },
        customerName: currentUser.profile?.name || null,
        customerEmail: currentUser.email
      })

      if (rzpRes.error) {
        throw new Error('Both Stripe and Razorpay are unconfigured. Please use the Instant Demo Activation button to test.')
      }

      await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      if (typeof Razorpay !== 'undefined') {
        const checkout = new Razorpay({
          ...rzpRes.data.checkoutOptions,
          handler: async (response) => {
            const verified = await insforge.payments.razorpay.verifySubscription('test', {
              subscriptionId: response.razorpay_subscription_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            })
            if (verified.error) throw verified.error
            alert('Subscription verified successfully!')
            showPremiumModal = false
            await loadEntitlement()
            render()
          }
        })
        checkout.open()
      } else {
        throw new Error('Razorpay Checkout script could not be loaded.')
      }
      return
    }

    if (data?.checkoutSession?.url) {
      window.location.assign(data.checkoutSession.url)
    } else {
      throw new Error('No checkout URL returned.')
    }
  } catch (err) {
    console.error('Checkout failed:', err.message)
    alert(`Checkout error: ${err.message}. Please use the "Instant Demo Activation (Free)" option to test this tier locally.`)
    btn.disabled = false
    btn.innerHTML = `<span>Subscribe Now</span>`
  }
}

async function handleDemoActivation() {
  const btn = document.getElementById('btn-demo-mode')
  btn.disabled = true
  btn.innerHTML = `<span>Activating…</span>`

  const { data, error } = await insforge.database
    .from('user_entitlements')
    .insert([{ user_id: currentUser.id, plan: 'premium', active: true }])
    .select()

  if (error && error.code === '23505') {
    const updateRes = await insforge.database
      .from('user_entitlements')
      .update({ plan: 'premium', active: true })
      .eq('user_id', currentUser.id)
      .select()
    
    if (updateRes.error) {
      console.error('Demo activation update failed:', updateRes.error.message)
      alert(`Activation failed: ${updateRes.error.message}`)
      btn.disabled = false
      btn.innerHTML = `<span>Instant Demo Activation (Free)</span>`
      return
    }
  } else if (error) {
    console.error('Demo activation insert failed:', error.message)
    alert(`Activation failed: ${error.message}`)
    btn.disabled = false
    btn.innerHTML = `<span>Instant Demo Activation (Free)</span>`
    return
  }

  alert('Premium tier activated successfully! You can now add unlimited tasks.')
  showPremiumModal = false
  await loadEntitlement()
  render()
}

async function handleStripePortal() {
  const btn = document.getElementById('btn-stripe-portal')
  btn.disabled = true
  btn.innerHTML = `<span>Loading Portal…</span>`

  try {
    const { data, error } = await insforge.payments.stripe.createCustomerPortalSession('test', {
      subject: { type: 'user', id: currentUser.id },
      returnUrl: window.location.origin
    })

    if (error) {
      throw error
    }

    if (data?.customerPortalSession?.url) {
      window.location.assign(data.customerPortalSession.url)
    } else {
      throw new Error('No portal URL returned.')
    }
  } catch (err) {
    console.error('Stripe portal redirect failed:', err.message)
    alert(`Stripe Customer Portal is only available for actual Stripe customers. Please use the "Downgrade to Free Tier (Demo)" button.`)
    btn.disabled = false
    btn.innerHTML = `<span>Stripe Customer Portal</span>`
  }
}

async function handleDemoDowngrade() {
  const btn = document.getElementById('btn-demo-downgrade')
  btn.disabled = true
  btn.innerHTML = `<span>Downgrading…</span>`

  const { error } = await insforge.database
    .from('user_entitlements')
    .update({ active: false, plan: 'free' })
    .eq('user_id', currentUser.id)

  if (error) {
    console.error('Demo downgrade failed:', error.message)
    alert(`Downgrade failed: ${error.message}`)
    btn.disabled = false
    btn.innerHTML = `<span>Downgrade to Free Tier (Demo)</span>`
    return
  }

  alert('Subscription downgraded back to Free. Your task limit has been reset to 3.')
  showManageBillingModal = false
  await loadEntitlement()
  render()
}

async function init() {
  isLoading = true
  render()

  const { data, error } = await insforge.auth.getCurrentUser()

  if (error || !data?.user) {
    currentUser = null
    isLoading = false
    render()
    return
  }

  currentUser = data.user
  await Promise.all([loadTodos(), loadEntitlement()])

  if (typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
  }

  syncAllAlarms()

  isLoading = false
  render()
}

init()

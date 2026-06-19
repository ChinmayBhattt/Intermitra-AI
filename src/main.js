import './style.css'
import { insforge } from './insforge.js'

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

const app = document.getElementById('app')

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
  if (isLoading) {
    app.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <span class="loading-text">Loading…</span>
      </div>`
    return
  }

  if (!currentUser) {
    renderLanding()
    return
  }

  renderApp()

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
      <input
        id="todo-input"
        class="add-todo-input"
        type="text"
        placeholder="What needs to be done?"
        autocomplete="off"
        maxlength="200"
      />
      <button type="submit" class="btn-add" id="btn-add-todo">
        <span>Add</span>
      </button>
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
  return `
    <div class="todo-item ${todo.completed ? 'completed' : ''}" style="animation-delay: ${index * 40}ms" data-id="${todo.id}">
      <label class="todo-checkbox">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
        <span class="checkmark">${icons.check}</span>
      </label>
      <span class="todo-title">${escapeHtml(todo.title)}</span>
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

  const { data, error } = await insforge.database
    .from('todos')
    .insert([{ title }])
    .select()

  if (error) {
    console.error('Failed to add todo:', error.message)
    btn.disabled = false
    return
  }

  todos.unshift(data[0])
  render()
}

async function handleToggleTodo(id) {
  const todo = todos.find(t => t.id === id)
  if (!todo) return

  const newCompleted = !todo.completed

  // Optimistic update
  todo.completed = newCompleted
  render()

  const { error } = await insforge.database
    .from('todos')
    .update({ completed: newCompleted })
    .eq('id', id)

  if (error) {
    console.error('Failed to toggle todo:', error.message)
    todo.completed = !newCompleted
    render()
  }
}

async function handleDeleteTodo(id) {
  const item = document.querySelector(`.todo-item[data-id="${id}"]`)
  if (item) {
    item.classList.add('removing')
    await new Promise(r => setTimeout(r, 280))
  }

  const idx = todos.findIndex(t => t.id === id)
  const removed = todos.splice(idx, 1)[0]
  render()

  const { error } = await insforge.database
    .from('todos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete todo:', error.message)
    todos.splice(idx, 0, removed)
    render()
  }
}

/* ================================================================
   Data Loading
   ================================================================ */
async function loadTodos() {
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
   Init
   ================================================================ */
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
  isLoading = false
  render()
}

init()

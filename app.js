/* ════════════════════════════════════════════════════════
   PAYTM CLONE — APP LOGIC
   ════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM References ───
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const header = $('#header');
  const mainContent = $('#mainContent');

  // Dark mode
  const darkModeToggle = $('#darkModeToggle');

  // Search
  const searchToggle = $('#searchToggle');
  const searchOverlay = $('#searchOverlay');
  const searchInput = $('#searchInput');
  const searchClose = $('#searchClose');

  // Notifications
  const notifToggle = $('#notifToggle');
  const notifPanel = $('#notifPanel');
  const notifBadge = $('#notifBadge');
  const notifList = $('#notifList');
  const markAllRead = $('#markAllRead');

  // Profile drawer
  const profileBtn = $('#profileBtn');
  const profileDrawer = $('#profileDrawer');
  const drawerBackdrop = $('#drawerBackdrop');
  const drawerClose = $('#drawerClose');

  // Modal
  const modalBackdrop = $('#modalBackdrop');
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  const modalClose = $('#modalClose');

  // Auth
  const authScreen = $('#authScreen');
  const appContainer = $('#appContainer');
  const loginForm = $('#loginForm');
  const logoutBtn = $('.logout-btn');

  // Toast
  const toast = $('#toast');

  // Bottom nav
  const bottomNav = $('#bottomNav');
  const navIndicator = $('#navIndicator');

  // UPI copy buttons
  const copyUpiBtn = $('#copyUpiBtn');
  const copyUpiDrawer = $('#copyUpiDrawer');
  const activateUpi = $('#activateUpi');

  // Feature cards
  const balanceCard = $('#balanceCard');
  const referCard = $('#referCard');

  // ═══════════════════════════════════════════════════════
  // DARK MODE
  // ═══════════════════════════════════════════════════════
  function initDarkMode() {
    const saved = localStorage.getItem('paytm-dark-mode');
    if (saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.body.classList.add('dark-mode');
    }
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('paytm-dark-mode', document.body.classList.contains('dark-mode'));
    showToast(document.body.classList.contains('dark-mode') ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  }

  initDarkMode();
  darkModeToggle.addEventListener('click', toggleDarkMode);

  // ═══════════════════════════════════════════════════════
  // AUTHENTICATION FLOW
  // ═══════════════════════════════════════════════════════
  function checkAuth() {
    const isLoggedIn = localStorage.getItem('neopay-auth') === 'true';
    if (isLoggedIn) {
      showDashboard();
    } else {
      showAuthScreen();
    }
  }

  function showAuthScreen() {
    authScreen.style.display = 'flex';
    appContainer.style.display = 'none';
    document.body.style.overflow = 'hidden';
  }

  function showDashboard() {
    authScreen.style.display = 'none';
    appContainer.style.display = 'block';
    document.body.style.overflow = '';
    // Re-trigger animations
    $$('.animate-in').forEach(el => {
      el.style.animation = 'none';
      el.offsetHeight; /* trigger reflow */
      el.style.animation = null;
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Mock login
      const btn = $('.auth-btn', loginForm);
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span class="spinner"></span> Authenticating...';
      btn.style.opacity = '0.8';
      
      setTimeout(() => {
        localStorage.setItem('neopay-auth', 'true');
        showDashboard();
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
        showToast('🔓 Successfully signed in!');
      }, 1500);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      closeDrawer();
      localStorage.removeItem('neopay-auth');
      showAuthScreen();
      showToast('🔒 Safely signed out');
    });
  }

  // ═══════════════════════════════════════════════════════
  // HEADER SCROLL EFFECT
  // ═══════════════════════════════════════════════════════
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header.classList.toggle('scrolled', scrollY > 10);
    lastScroll = scrollY;
  }, { passive: true });

  // ═══════════════════════════════════════════════════════
  // SEARCH
  // ═══════════════════════════════════════════════════════
  function openSearch() {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput.focus(), 300);
    closeNotifPanel();
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
  }

  searchToggle.addEventListener('click', openSearch);
  searchClose.addEventListener('click', closeSearch);

  // Filter suggestions
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    $$('.suggestion-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = !query || text.includes(query) ? '' : 'none';
    });
  });

  // Click suggestion to open modal
  $$('.suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const service = item.dataset.service;
      closeSearch();
      setTimeout(() => openServiceModal(service), 200);
    });
  });

  // ═══════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════
  let notifications = [];

  async function loadNotifications() {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      notifications = data.notifications;
      renderNotifications();
    } catch (e) {
      // Fallback static data
      notifications = [
        { id: 1, title: 'Cashback Credited! 🎉', message: '₹25 cashback for your Amazon payment', time: '2 hours ago', read: false },
        { id: 2, title: 'Bill Reminder', message: 'Your electricity bill is due in 3 days', time: '5 hours ago', read: false },
        { id: 3, title: 'New Offer!', message: 'Get 10% cashback on mobile recharge', time: '1 day ago', read: false },
      ];
      renderNotifications();
    }
  }

  function renderNotifications() {
    const unreadCount = notifications.filter(n => !n.read).length;
    notifBadge.textContent = unreadCount;
    notifBadge.classList.toggle('hidden', unreadCount === 0);

    notifList.innerHTML = notifications.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" data-id="${n.id}">
        <div class="notif-dot"></div>
        <div class="notif-content">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${n.time}</div>
        </div>
      </div>
    `).join('');

    // Click to mark individual as read
    $$('.notif-item', notifList).forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const notif = notifications.find(n => n.id === id);
        if (notif) notif.read = true;
        renderNotifications();
      });
    });
  }

  function toggleNotifPanel() {
    const isOpen = notifPanel.classList.contains('active');
    if (isOpen) {
      closeNotifPanel();
    } else {
      notifPanel.classList.add('active');
      notifToggle.classList.add('shake');
      setTimeout(() => notifToggle.classList.remove('shake'), 600);
      closeSearch();
    }
  }

  function closeNotifPanel() {
    notifPanel.classList.remove('active');
  }

  notifToggle.addEventListener('click', toggleNotifPanel);
  markAllRead.addEventListener('click', () => {
    notifications.forEach(n => n.read = true);
    renderNotifications();
    showToast('✓ All notifications marked as read');
  });

  // Close notif panel on outside click
  document.addEventListener('click', (e) => {
    if (!notifPanel.contains(e.target) && !notifToggle.contains(e.target)) {
      closeNotifPanel();
    }
  });

  loadNotifications();

  // ═══════════════════════════════════════════════════════
  // PROFILE DRAWER
  // ═══════════════════════════════════════════════════════
  function openDrawer() {
    profileDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    profileDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  profileBtn.addEventListener('click', openDrawer);
  drawerClose.addEventListener('click', closeDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);

  // ═══════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════
  let toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('active');
    toastTimer = setTimeout(() => {
      toast.classList.remove('active');
    }, 2500);
  }

  // ═══════════════════════════════════════════════════════
  // COPY UPI
  // ═══════════════════════════════════════════════════════
  function copyUpi() {
    navigator.clipboard.writeText('c.n@ptyes').then(() => {
      showToast('📋 UPI ID copied to clipboard!');
    }).catch(() => {
      showToast('📋 UPI ID: c.n@ptyes');
    });
  }

  copyUpiBtn.addEventListener('click', copyUpi);
  copyUpiDrawer.addEventListener('click', copyUpi);

  // ═══════════════════════════════════════════════════════
  // MODAL SYSTEM
  // ═══════════════════════════════════════════════════════
  function openModal(title, content) {
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modalBackdrop.classList.add('active');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Bind modal form events after rendering
    bindModalEvents();
  }

  function closeModal() {
    modalBackdrop.classList.remove('active');
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeDrawer();
      closeSearch();
      closeNotifPanel();
    }
  });

  function bindModalEvents() {
    // Plan cards selection
    $$('.plan-card', modalBody).forEach(card => {
      card.addEventListener('click', () => {
        $$('.plan-card', modalBody).forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    // Form submission
    const form = $('.modal-form', modalBody);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal();
        showToast('✅ Action completed successfully!');
      });
    }

    // AI chat
    const aiInput = $('.ai-input-row input', modalBody);
    const aiSendBtn = $('.ai-send-btn', modalBody);
    const aiChat = $('.ai-chat', modalBody);
    if (aiInput && aiSendBtn && aiChat) {
      const sendAiMessage = () => {
        const text = aiInput.value.trim();
        if (!text) return;
        aiChat.insertAdjacentHTML('beforeend', `<div class="ai-message user">${escapeHtml(text)}</div>`);
        aiInput.value = '';
        aiChat.scrollTop = aiChat.scrollHeight;
        setTimeout(() => {
          aiChat.insertAdjacentHTML('beforeend', `<div class="ai-message bot">Thanks for your message! I'm a mock AI assistant. In the full app, I'd help you with payments, bills, and more. 🤖</div>`);
          aiChat.scrollTop = aiChat.scrollHeight;
        }, 800);
      };
      aiSendBtn.addEventListener('click', sendAiMessage);
      aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAiMessage();
      });
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── Modal Content Generators ───

  const modalContentGenerators = {
    'scan': () => ({
      title: 'Scan & Pay',
      content: `
        <div style="text-align:center; padding: 20px 0;">
          <div style="width:200px; height:200px; margin:0 auto 20px; background:var(--bg-surface); border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:64px;">📸</div>
          <p style="color:var(--text-secondary); margin-bottom:20px;">Point your camera at any QR code to pay instantly</p>
          <button class="modal-btn" onclick="this.textContent='📷 Camera access needed'; this.style.opacity=0.6">Open Camera</button>
        </div>`
    }),
    'mobile': () => ({
      title: 'Send to Mobile',
      content: `
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Mobile Number</label>
            <input class="modal-input" type="tel" placeholder="Enter 10-digit mobile number" maxlength="10" required pattern="[0-9]{10}">
          </div>
          <div class="modal-form-group">
            <label>Amount (₹)</label>
            <input class="modal-input" type="number" placeholder="Enter amount" min="1" required>
          </div>
          <div class="modal-form-group">
            <label>Message (Optional)</label>
            <input class="modal-input" type="text" placeholder="Add a note">
          </div>
          <button type="submit" class="modal-btn">💸 Send Money</button>
        </form>`
    }),
    'bank': () => ({
      title: 'Send to Bank / UPI',
      content: `
        <form class="modal-form">
          <div class="modal-form-group">
            <label>UPI ID or Account Number</label>
            <input class="modal-input" type="text" placeholder="name@upi or account number" required>
          </div>
          <div class="modal-form-group">
            <label>IFSC Code (for bank transfer)</label>
            <input class="modal-input" type="text" placeholder="e.g., SBIN0001234">
          </div>
          <div class="modal-form-group">
            <label>Amount (₹)</label>
            <input class="modal-input" type="number" placeholder="Enter amount" min="1" required>
          </div>
          <button type="submit" class="modal-btn">🏦 Transfer Now</button>
        </form>`
    }),
    'self': () => ({
      title: 'Transfer to Self',
      content: `
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Select Account</label>
            <select class="modal-input">
              <option>SBI Savings - ****4521</option>
              <option>HDFC Savings - ****7890</option>
              <option>ICICI Current - ****1234</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label>Amount (₹)</label>
            <input class="modal-input" type="number" placeholder="Enter amount" min="1" required>
          </div>
          <button type="submit" class="modal-btn">💰 Transfer</button>
        </form>`
    }),
    'recharge': () => ({
      title: 'Mobile Recharge',
      content: `
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Mobile Number</label>
            <input class="modal-input" type="tel" placeholder="Enter mobile number" maxlength="10" required>
          </div>
          <div class="modal-form-group">
            <label>Select a Plan</label>
          </div>
          <div id="plansList">
            <div class="skeleton" style="height:70px; margin-bottom:12px;"></div>
            <div class="skeleton" style="height:70px; margin-bottom:12px;"></div>
            <div class="skeleton" style="height:70px;"></div>
          </div>
          <button type="submit" class="modal-btn" style="margin-top:20px">⚡ Recharge Now</button>
        </form>`
    }),
    'credit-card': () => ({
      title: 'Credit Card Payment',
      content: `
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Card Number</label>
            <input class="modal-input" type="text" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" required>
          </div>
          <div class="modal-form-group">
            <label>Amount (₹)</label>
            <input class="modal-input" type="number" placeholder="Enter amount" min="1" required>
          </div>
          <button type="submit" class="modal-btn">💳 Pay Now</button>
        </form>`
    }),
    'electricity': () => ({
      title: 'Electricity Bill',
      content: `
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Electricity Provider</label>
            <select class="modal-input">
              <option>BSES Rajdhani</option>
              <option>BSES Yamuna</option>
              <option>Tata Power Delhi</option>
              <option>NDPL</option>
              <option>Adani Electricity</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label>Consumer Number</label>
            <input class="modal-input" type="text" placeholder="Enter consumer number" required>
          </div>
          <button type="submit" class="modal-btn">⚡ Fetch Bill</button>
        </form>`
    }),
    'fastag': () => ({
      title: 'FASTag Recharge',
      content: `
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Vehicle Number</label>
            <input class="modal-input" type="text" placeholder="e.g., DL01AB1234" required>
          </div>
          <div class="modal-form-group">
            <label>Amount (₹)</label>
            <input class="modal-input" type="number" placeholder="Min ₹100" min="100" required>
          </div>
          <button type="submit" class="modal-btn">🚗 Recharge FASTag</button>
        </form>`
    }),
    'loan': () => ({
      title: 'Personal Loan',
      content: `
        <div style="text-align:center; margin-bottom:20px;">
          <div style="font-size:48px; margin-bottom:10px;">💰</div>
          <h3 style="font-size:18px; margin-bottom:8px;">Get Instant Personal Loan</h3>
          <p style="color:var(--text-secondary); font-size:13px;">Up to ₹5,00,000 at competitive interest rates</p>
        </div>
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Desired Amount (₹)</label>
            <input class="modal-input" type="number" placeholder="e.g., 100000" min="10000" max="500000" required>
          </div>
          <div class="modal-form-group">
            <label>Employment Type</label>
            <select class="modal-input">
              <option>Salaried</option>
              <option>Self-Employed</option>
              <option>Business</option>
            </select>
          </div>
          <div class="modal-form-group">
            <label>Monthly Income (₹)</label>
            <input class="modal-input" type="number" placeholder="Enter monthly income" required>
          </div>
          <button type="submit" class="modal-btn">📋 Check Eligibility</button>
        </form>`
    }),
    'gold': () => ({
      title: 'Buy Digital Gold',
      content: `
        <div class="gold-price-display">
          <div style="font-size:48px; margin-bottom:10px;">🥇</div>
          <div class="gold-current-price" id="goldPrice">Loading...</div>
          <div class="gold-change" id="goldChange"></div>
          <div class="gold-unit">per gram (24K)</div>
        </div>
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Enter Amount (₹) or Weight (gm)</label>
            <input class="modal-input" type="number" placeholder="e.g., 500" min="1" required>
          </div>
          <button type="submit" class="modal-btn">🥇 Buy Gold Now</button>
          <button type="button" class="modal-btn secondary" style="margin-top:8px;" onclick="loadGoldPrice()">🔄 Refresh Price</button>
        </form>`
    }),
    'movies': () => ({
      title: 'Movies & Events',
      content: `
        <div style="text-align:center; padding:20px 0;">
          <div style="font-size:48px; margin-bottom:10px;">🎬</div>
          <h3 style="margin-bottom:12px;">Now Showing</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
            <div style="background:var(--bg-surface); padding:16px; border-radius:12px; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
              <div style="font-size:32px; margin-bottom:8px;">🎭</div>
              <div style="font-weight:600; font-size:13px;">Blockbuster 2026</div>
              <div style="font-size:11px; color:var(--text-tertiary);">⭐ 8.5 | Action</div>
            </div>
            <div style="background:var(--bg-surface); padding:16px; border-radius:12px; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
              <div style="font-size:32px; margin-bottom:8px;">🎪</div>
              <div style="font-weight:600; font-size:13px;">Comedy Night</div>
              <div style="font-size:11px; color:var(--text-tertiary);">⭐ 7.8 | Comedy</div>
            </div>
            <div style="background:var(--bg-surface); padding:16px; border-radius:12px; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
              <div style="font-size:32px; margin-bottom:8px;">🚀</div>
              <div style="font-weight:600; font-size:13px;">Space Odyssey</div>
              <div style="font-size:11px; color:var(--text-tertiary);">⭐ 9.0 | Sci-Fi</div>
            </div>
            <div style="background:var(--bg-surface); padding:16px; border-radius:12px; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
              <div style="font-size:32px; margin-bottom:8px;">💕</div>
              <div style="font-weight:600; font-size:13px;">Love Story</div>
              <div style="font-size:11px; color:var(--text-tertiary);">⭐ 7.2 | Romance</div>
            </div>
          </div>
          <button class="modal-btn">🎟️ Book Tickets</button>
        </div>`
    }),
    'credit-carnival': () => ({
      title: 'Credit Card Carnival',
      content: `
        <div style="text-align:center; padding:20px 0;">
          <div style="font-size:48px; margin-bottom:10px;">🎪</div>
          <h3 style="margin-bottom:8px;">Exclusive Credit Card Offers</h3>
          <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">Get amazing rewards on new card applications</p>
          <div style="background:var(--bg-surface); padding:16px; border-radius:12px; margin-bottom:12px; text-align:left;">
            <div style="font-weight:600;">HDFC Millennia 💳</div>
            <div style="font-size:12px; color:var(--text-secondary);">5% cashback on Amazon, Flipkart & more</div>
          </div>
          <div style="background:var(--bg-surface); padding:16px; border-radius:12px; margin-bottom:12px; text-align:left;">
            <div style="font-weight:600;">SBI SimplyCLICK 💳</div>
            <div style="font-size:12px; color:var(--text-secondary);">10X rewards on partner brands</div>
          </div>
          <div style="background:var(--bg-surface); padding:16px; border-radius:12px; margin-bottom:20px; text-align:left;">
            <div style="font-weight:600;">Axis Flipkart 💳</div>
            <div style="font-size:12px; color:var(--text-secondary);">Unlimited cashback on all spends</div>
          </div>
          <button class="modal-btn">Apply Now →</button>
        </div>`
    }),
    'paytm-money': () => ({
      title: 'Paytm Money',
      content: `
        <div style="text-align:center; padding:20px 0;">
          <div style="font-size:48px; margin-bottom:10px;">📈</div>
          <h3 style="margin-bottom:8px;">Invest Smart with Paytm Money</h3>
          <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">Mutual Funds, Stocks, IPOs & more</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
            <div style="background:var(--bg-surface); padding:16px; border-radius:12px; text-align:center;">
              <div style="font-weight:700; color:var(--accent-green);">+15.3%</div>
              <div style="font-size:11px; color:var(--text-secondary);">Nifty 50 (1Y)</div>
            </div>
            <div style="background:var(--bg-surface); padding:16px; border-radius:12px; text-align:center;">
              <div style="font-weight:700; color:var(--accent-green);">+22.1%</div>
              <div style="font-size:11px; color:var(--text-secondary);">Sensex (1Y)</div>
            </div>
          </div>
          <button class="modal-btn">Start Investing →</button>
        </div>`
    }),
    'sip': () => ({
      title: 'JanNivesh SIP @ ₹250',
      content: `
        <div style="text-align:center; padding:20px 0;">
          <div style="font-size:48px; margin-bottom:10px;">📊</div>
          <h3 style="margin-bottom:8px;">Start SIP from just ₹250/month</h3>
          <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">Build wealth systematically with small monthly investments</p>
        </div>
        <form class="modal-form">
          <div class="modal-form-group">
            <label>Monthly SIP Amount (₹)</label>
            <input class="modal-input" type="number" placeholder="Min ₹250" min="250" required>
          </div>
          <div class="modal-form-group">
            <label>Investment Period</label>
            <select class="modal-input">
              <option>1 Year</option>
              <option>3 Years</option>
              <option selected>5 Years</option>
              <option>10 Years</option>
            </select>
          </div>
          <button type="submit" class="modal-btn">🚀 Start SIP</button>
        </form>`
    }),
    'credit-score': () => ({
      title: 'Free Credit Score',
      content: `
        <div style="text-align:center; padding:20px 0;">
          <div style="width:160px; height:160px; margin:0 auto 20px; border-radius:50%; background:conic-gradient(var(--accent-green) 0% 78%, var(--border-color) 78% 100%); display:flex; align-items:center; justify-content:center;">
            <div style="width:130px; height:130px; border-radius:50%; background:var(--bg-card); display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <div style="font-size:36px; font-weight:800; color:var(--accent-green);">782</div>
              <div style="font-size:11px; color:var(--text-tertiary);">Excellent</div>
            </div>
          </div>
          <p style="color:var(--text-secondary); font-size:13px; margin-bottom:20px;">Your credit score is excellent! You're eligible for premium credit cards and low-interest loans.</p>
          <button class="modal-btn">View Full Report →</button>
        </div>`
    }),
    'cashback': () => ({
      title: 'Cashback & Offers',
      content: `
        <div style="padding:10px 0;">
          <div style="background:linear-gradient(135deg, rgba(0,185,245,0.1), rgba(0,200,83,0.1)); padding:20px; border-radius:16px; text-align:center; margin-bottom:20px;">
            <div style="font-size:32px; margin-bottom:8px;">🎁</div>
            <div style="font-size:24px; font-weight:800;">₹156.50</div>
            <div style="font-size:12px; color:var(--text-secondary);">Total Cashback Earned</div>
          </div>
          <h4 style="margin-bottom:12px;">Active Offers</h4>
          <div style="background:var(--bg-surface); padding:14px; border-radius:12px; margin-bottom:10px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:24px;">📱</span>
            <div>
              <div style="font-weight:600; font-size:13px;">10% off on Mobile Recharge</div>
              <div style="font-size:11px; color:var(--text-tertiary);">Max cashback ₹50 · Ends tomorrow</div>
            </div>
          </div>
          <div style="background:var(--bg-surface); padding:14px; border-radius:12px; margin-bottom:10px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:24px;">⚡</span>
            <div>
              <div style="font-weight:600; font-size:13px;">₹75 off on Electricity Bill</div>
              <div style="font-size:11px; color:var(--text-tertiary);">Min bill ₹500 · 5 days left</div>
            </div>
          </div>
          <div style="background:var(--bg-surface); padding:14px; border-radius:12px; display:flex; align-items:center; gap:12px;">
            <span style="font-size:24px;">🛒</span>
            <div>
              <div style="font-weight:600; font-size:13px;">Flat 20% off on Shopping</div>
              <div style="font-size:11px; color:var(--text-tertiary);">Use code SHOP20 · 1 week left</div>
            </div>
          </div>
        </div>`
    }),
    'all-services': () => ({
      title: 'All Services',
      content: `
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:10px 0;">
          ${['📱 Recharge', '💳 Cards', '⚡ Electricity', '🚗 FASTag', '💰 Loans', '🥇 Gold', '🎬 Movies', '📊 SIP', '📈 Stocks', '🎁 Rewards', '🏦 Banking', '🎫 Events'].map(s => {
            const [icon, label] = s.split(' ');
            return `<div style="background:var(--bg-surface); padding:16px; border-radius:12px; text-align:center; cursor:pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
              <div style="font-size:28px; margin-bottom:6px;">${icon}</div>
              <div style="font-size:12px; font-weight:500;">${label}</div>
            </div>`;
          }).join('')}
        </div>`
    }),
    'all-services-alt': () => ({
      title: 'More Services',
      content: `
        <div style="text-align:center; padding:20px 0;">
          <div style="font-size:48px; margin-bottom:10px;">🔮</div>
          <h3 style="margin-bottom:8px;">More Coming Soon!</h3>
          <p style="color:var(--text-secondary); font-size:13px;">We're adding exciting new features. Stay tuned!</p>
        </div>`
    }),
  };

  function openServiceModal(serviceId) {
    const generator = modalContentGenerators[serviceId];
    if (generator) {
      const { title, content } = generator();
      openModal(title, content);

      // Load dynamic data for specific modals
      if (serviceId === 'recharge') loadPlans();
      if (serviceId === 'gold') loadGoldPrice();
    } else {
      openModal('Service', `<div style="text-align:center; padding:20px;"><div style="font-size:48px; margin-bottom:10px;">🚧</div><p style="color:var(--text-secondary);">This service is coming soon!</p></div>`);
    }
  }

  // Make loadGoldPrice available globally for the refresh button
  window.loadGoldPrice = loadGoldPrice;

  // ─── Dynamic Data Loaders ───

  async function loadPlans() {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      const plansList = $('#plansList');
      if (plansList) {
        plansList.innerHTML = data.plans.map(p => `
          <div class="plan-card ${p.popular ? 'popular' : ''}">
            <div>
              <div class="plan-amount">₹${p.amount}</div>
              <div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">${p.description}</div>
            </div>
            <div class="plan-details">
              <div class="plan-validity">${p.validity}</div>
              <div class="plan-data">${p.data}</div>
            </div>
          </div>
        `).join('');
        // Bind click events
        $$('.plan-card', plansList).forEach(card => {
          card.addEventListener('click', () => {
            $$('.plan-card', plansList).forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
          });
        });
      }
    } catch (e) {
      console.error('Failed to load plans:', e);
    }
  }

  async function loadGoldPrice() {
    try {
      const res = await fetch('/api/gold-price');
      const data = await res.json();
      const priceEl = $('#goldPrice');
      const changeEl = $('#goldChange');
      if (priceEl) priceEl.textContent = `₹${data.price}`;
      if (changeEl) {
        changeEl.textContent = `${data.change} (${data.trend === 'up' ? '📈' : '📉'})`;
        changeEl.className = `gold-change ${data.trend}`;
      }
    } catch (e) {
      console.error('Failed to load gold price:', e);
    }
  }

  async function loadBalance() {
    try {
      const res = await fetch('/api/balance');
      const data = await res.json();
      return data;
    } catch (e) {
      return { wallet: 2547.80, cashback: 156.50 };
    }
  }

  async function loadTransactions() {
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      return data.transactions;
    } catch (e) {
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════
  // SERVICE / FEATURE CARD CLICK HANDLERS
  // ═══════════════════════════════════════════════════════

  // Action cards & option cards
  $$('[data-modal]').forEach(card => {
    card.addEventListener('click', () => {
      createRipple(event, card);
      openServiceModal(card.dataset.modal);
    });
  });

  // Balance card
  balanceCard.addEventListener('click', async () => {
    const balance = await loadBalance();
    const transactions = await loadTransactions();
    openModal('Balance & History', `
      <div style="background:linear-gradient(135deg, rgba(0,185,245,0.08), rgba(0,200,83,0.08)); padding:24px; border-radius:16px; text-align:center; margin-bottom:20px;">
        <div style="font-size:12px; color:var(--text-secondary); margin-bottom:4px;">Wallet Balance</div>
        <div style="font-size:32px; font-weight:800;">₹${balance.wallet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        <div style="font-size:12px; color:var(--accent-green); margin-top:4px;">Cashback: ₹${balance.cashback}</div>
      </div>
      <h4 style="margin-bottom:12px;">Recent Transactions</h4>
      ${transactions.map(t => `
        <div class="txn-item">
          <div class="txn-icon">${t.icon}</div>
          <div class="txn-info">
            <div class="txn-name">${t.type === 'debit' ? t.to : t.from}</div>
            <div class="txn-date">${new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
          </div>
          <div class="txn-amount ${t.type}">${t.type === 'debit' ? '-' : '+'}₹${t.amount}</div>
        </div>
      `).join('')}
    `);
  });

  // Refer card
  referCard.addEventListener('click', () => {
    openModal('Refer & Earn', `
      <div style="text-align:center; padding:10px 0;">
        <div style="font-size:48px; margin-bottom:10px;">🎉</div>
        <h3 style="margin-bottom:8px;">Invite Friends & Earn ₹100</h3>
        <p style="color:var(--text-secondary); font-size:13px; margin-bottom:24px;">Share your referral code. When they sign up and make a payment, you both get ₹100!</p>
      </div>
      <div class="referral-code-box">
        <div class="referral-code">PAYTM2026</div>
        <div class="referral-sub">Your referral code</div>
      </div>
      <button class="modal-btn" onclick="navigator.clipboard.writeText('PAYTM2026').then(()=>{document.querySelector('.toast').textContent='📋 Referral code copied!';document.querySelector('.toast').classList.add('active');setTimeout(()=>document.querySelector('.toast').classList.remove('active'),2500)})">📋 Copy & Share Code</button>
    `);
  });

  // UPI Lite Activate
  activateUpi.addEventListener('click', () => {
    openModal('UPI Lite', `
      <div style="text-align:center; padding:20px 0;">
        <div style="font-size:48px; margin-bottom:10px;">⚡</div>
        <h3 style="margin-bottom:8px;">Activate UPI Lite</h3>
        <p style="color:var(--text-secondary); font-size:13px; margin-bottom:24px;">Make small payments (up to ₹500) without entering UPI PIN. Super fast and secure!</p>
        <div style="background:var(--bg-surface); padding:16px; border-radius:12px; margin-bottom:20px; text-align:left;">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <span>✅</span><span style="font-size:13px;">Payments up to ₹500 without PIN</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
            <span>✅</span><span style="font-size:13px;">Instant transactions</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px;">
            <span>✅</span><span style="font-size:13px;">Load up to ₹2,000 in UPI Lite wallet</span>
          </div>
        </div>
        <button class="modal-btn" onclick="this.textContent='✅ Activation request sent!'; this.style.background='var(--accent-green)'; this.disabled=true;">Activate UPI Lite</button>
      </div>
    `);
  });

  // ═══════════════════════════════════════════════════════
  // BOTTOM NAVIGATION
  // ═══════════════════════════════════════════════════════
  const navItems = $$('.nav-item', bottomNav);

  function setActiveNav(tabName) {
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });
    updateNavIndicator();
  }

  function updateNavIndicator() {
    const activeItem = $('.nav-item.active', bottomNav);
    if (activeItem && navIndicator) {
      const rect = activeItem.getBoundingClientRect();
      const navRect = bottomNav.getBoundingClientRect();
      navIndicator.style.left = `${rect.left - navRect.left + (rect.width - 32) / 2}px`;
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      setActiveNav(tab);

      // Tab-specific actions
      switch (tab) {
        case 'home':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'scan':
          openServiceModal('scan');
          break;
        case 'cashback':
          openServiceModal('cashback');
          break;
        case 'ai':
          openModal('Ask AI', `
            <div class="ai-chat">
              <div class="ai-message bot">👋 Hi! I'm your Paytm AI assistant. How can I help you today? I can help with payments, bills, investments, and more!</div>
              <div class="ai-input-row">
                <input type="text" placeholder="Type a message...">
                <button class="ai-send-btn">➤</button>
              </div>
            </div>
          `);
          break;
        case 'services':
          openServiceModal('all-services');
          break;
      }
    });
  });

  // Position indicator on load
  setTimeout(updateNavIndicator, 100);
  window.addEventListener('resize', updateNavIndicator);

  // ═══════════════════════════════════════════════════════
  // RIPPLE EFFECT
  // ═══════════════════════════════════════════════════════
  function createRipple(event, element) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    element.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  // ═══════════════════════════════════════════════════════
  // SCROLL ANIMATIONS (Intersection Observer)
  // ═══════════════════════════════════════════════════════
  const animatedElements = $$('.animate-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  // Initialize App
  checkAuth();

})();

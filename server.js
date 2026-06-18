const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ─── Mock API Routes ─────────────────────────────────────────

// Wallet balance
app.get('/api/balance', (req, res) => {
  res.json({
    wallet: 2547.80,
    upiLite: 0,
    cashback: 156.50,
    currency: 'INR'
  });
});

// Recent transactions
app.get('/api/transactions', (req, res) => {
  res.json({
    transactions: [
      { id: 1, type: 'debit', to: 'Amazon Pay', amount: 499, date: '2026-06-17', status: 'success', icon: '🛒' },
      { id: 2, type: 'credit', from: 'Cashback Reward', amount: 25, date: '2026-06-16', status: 'success', icon: '🎁' },
      { id: 3, type: 'debit', to: 'Electricity Bill', amount: 1850, date: '2026-06-15', status: 'success', icon: '⚡' },
      { id: 4, type: 'debit', to: 'Mobile Recharge', amount: 299, date: '2026-06-14', status: 'success', icon: '📱' },
      { id: 5, type: 'credit', from: 'Rahul Sharma', amount: 500, date: '2026-06-13', status: 'success', icon: '👤' },
    ]
  });
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json({
    notifications: [
      { id: 1, title: 'Cashback Credited! 🎉', message: '₹25 cashback for your Amazon payment', time: '2 hours ago', read: false },
      { id: 2, title: 'Bill Reminder', message: 'Your electricity bill is due in 3 days', time: '5 hours ago', read: false },
      { id: 3, title: 'New Offer!', message: 'Get 10% cashback on mobile recharge', time: '1 day ago', read: false },
      { id: 4, title: 'Payment Successful', message: '₹299 paid to Airtel Prepaid', time: '2 days ago', read: true },
      { id: 5, title: 'Gold Price Drop', message: 'Gold prices are down 2%. Good time to invest!', time: '3 days ago', read: true },
    ]
  });
});

// Recharge plans
app.get('/api/plans', (req, res) => {
  res.json({
    plans: [
      { id: 1, amount: 199, validity: '24 days', data: '1.5 GB/day', description: 'Unlimited calls + 100 SMS/day' },
      { id: 2, amount: 299, validity: '28 days', data: '2 GB/day', description: 'Unlimited calls + 100 SMS/day', popular: true },
      { id: 3, amount: 479, validity: '56 days', data: '1.5 GB/day', description: 'Unlimited calls + 100 SMS/day' },
      { id: 4, amount: 719, validity: '84 days', data: '2 GB/day', description: 'Unlimited calls + 100 SMS/day', popular: true },
      { id: 5, amount: 2999, validity: '365 days', data: '2 GB/day', description: 'Unlimited calls + 100 SMS/day' },
    ]
  });
});

// Gold price
app.get('/api/gold-price', (req, res) => {
  const basePrice = 7245;
  const fluctuation = (Math.random() - 0.5) * 100;
  res.json({
    price: (basePrice + fluctuation).toFixed(2),
    change: fluctuation > 0 ? `+${fluctuation.toFixed(2)}` : fluctuation.toFixed(2),
    trend: fluctuation > 0 ? 'up' : 'down',
    unit: 'per gram',
    currency: 'INR'
  });
});

// Catch-all: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n  🚀 Paytm Clone is running!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}`);
    console.log(`  ➜ Press Ctrl+C to stop\n`);
  });
}

module.exports = app;

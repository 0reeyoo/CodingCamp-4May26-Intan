const STORAGE_KEY = 'expense_tracker_data_v1';
const THEME_KEY = 'expense_tracker_theme_v1';

const state = {
  transactions: [],
  categories: ['Makanan', 'Transportasi', 'Hiburan'],
  spendingLimit: 0,
  chart: null,
  sortBy: 'newest'
};

const el = {
  form: document.getElementById('expenseForm'),
  itemName: document.getElementById('itemName'),
  itemAmount: document.getElementById('itemAmount'),
  itemCategory: document.getElementById('itemCategory'),
  transactionList: document.getElementById('transactionList'),
  totalBalance: document.getElementById('totalBalance'),
  formError: document.getElementById('formError'),
  addCategoryBtn: document.getElementById('addCategoryBtn'),
  customCategory: document.getElementById('customCategory'),
  sortBy: document.getElementById('sortBy'),
  spendingLimit: document.getElementById('spendingLimit'),
  limitNotice: document.getElementById('limitNotice'),
  themeToggle: document.getElementById('themeToggle')
};

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    state.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
    state.categories = Array.isArray(parsed.categories) && parsed.categories.length ? parsed.categories : state.categories;
    state.spendingLimit = Number(parsed.spendingLimit) || 0;
    state.sortBy = parsed.sortBy || 'newest';
  } catch {
    state.transactions = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    transactions: state.transactions,
    categories: state.categories,
    spendingLimit: state.spendingLimit,
    sortBy: state.sortBy
  }));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 }).format(amount);
}

function showError(message) {
  el.formError.textContent = message;
  el.formError.classList.remove('hidden');
}

function hideError() {
  el.formError.textContent = '';
  el.formError.classList.add('hidden');
}

function refreshCategoryOptions() {
  const selected = el.itemCategory.value;
  el.itemCategory.innerHTML = '<option value="">Pilih kategori</option>';
  state.categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    el.itemCategory.appendChild(option);
  });
  el.itemCategory.value = state.categories.includes(selected) ? selected : '';
}

function sortedTransactions() {
  const items = [...state.transactions];
  if (state.sortBy === 'amount-desc') items.sort((a, b) => b.amount - a.amount);
  if (state.sortBy === 'amount-asc') items.sort((a, b) => a.amount - b.amount);
  if (state.sortBy === 'category') items.sort((a, b) => a.category.localeCompare(b.category, 'id-ID'));
  if (state.sortBy === 'newest') items.sort((a, b) => b.createdAt - a.createdAt);
  return items;
}

function renderTransactions() {
  const items = sortedTransactions();
  el.transactionList.innerHTML = '';
  if (!items.length) {
    const empty = document.createElement('li');
    empty.textContent = 'Belum ada transaksi.';
    empty.className = 'transaction-category';
    el.transactionList.appendChild(empty);
    return;
  }
  items.forEach((trx) => {
    const li = document.createElement('li');
    li.className = 'transaction-item';

    const meta = document.createElement('div');
    meta.className = 'transaction-meta';
    const name = document.createElement('p');
    name.className = 'transaction-name';
    name.textContent = trx.name;
    const amount = document.createElement('p');
    amount.className = 'transaction-amount';
    amount.textContent = formatCurrency(trx.amount);
    const category = document.createElement('p');
    category.className = 'transaction-category';
    category.textContent = trx.category;
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.type = 'button';
    delBtn.textContent = 'Hapus';
    delBtn.addEventListener('click', () => removeTransaction(trx.id));

    meta.append(name, amount, category);
    li.append(meta, delBtn);
    el.transactionList.appendChild(li);
  });
}

function updateBalanceAndLimit() {
  const total = state.transactions.reduce((sum, t) => sum + t.amount, 0);
  el.totalBalance.textContent = formatCurrency(total);
  const overLimit = state.spendingLimit > 0 && total > state.spendingLimit;
  el.limitNotice.classList.toggle('hidden', !overLimit);
}

function updateChart() {
  const totals = {};
  state.transactions.forEach((trx) => {
    totals[trx.category] = (totals[trx.category] || 0) + trx.amount;
  });
  const labels = Object.keys(totals);
  const values = Object.values(totals);
  if (!state.chart) {
    state.chart = new Chart(document.getElementById('expenseChart'), {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: ['#22c55e', '#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6', '#14b8a6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
    return;
  }
  state.chart.data.labels = labels;
  state.chart.data.datasets[0].data = values;
  state.chart.update();
}

function removeTransaction(id) {
  state.transactions = state.transactions.filter((trx) => trx.id !== id);
  saveData();
  renderAll();
}

function addTransaction(event) {
  event.preventDefault();
  hideError();
  const name = el.itemName.value.trim();
  const amount = Number(el.itemAmount.value);
  const category = el.itemCategory.value;

  if (!name || !el.itemAmount.value || !category) return showError('Semua kolom wajib diisi.');
  if (!Number.isFinite(amount) || amount <= 0) return showError('Jumlah harus lebih dari 0.');

  state.transactions.push({
    id: Date.now(),
    name,
    amount,
    category,
    createdAt: Date.now()
  });

  el.form.reset();
  el.itemCategory.value = '';
  saveData();
  renderAll();
}

function addCustomCategory() {
  const custom = el.customCategory.value.trim();
  if (!custom) return;
  const exists = state.categories.some((c) => c.toLowerCase() === custom.toLowerCase());
  if (!exists) {
    state.categories.push(custom);
    refreshCategoryOptions();
    saveData();
  }
  el.itemCategory.value = custom;
  el.customCategory.value = '';
}

function applyTheme() {
  const dark = localStorage.getItem(THEME_KEY) === 'dark';
  document.body.classList.toggle('dark', dark);
  el.themeToggle.textContent = dark ? 'Mode Terang' : 'Mode Gelap';
}

function toggleTheme() {
  localStorage.setItem(THEME_KEY, document.body.classList.contains('dark') ? 'light' : 'dark');
  applyTheme();
}

function renderAll() {
  renderTransactions();
  updateBalanceAndLimit();
  updateChart();
}

function init() {
  loadData();
  refreshCategoryOptions();
  el.sortBy.value = state.sortBy;
  el.spendingLimit.value = state.spendingLimit || '';

  el.form.addEventListener('submit', addTransaction);
  el.addCategoryBtn.addEventListener('click', addCustomCategory);
  el.sortBy.addEventListener('change', (event) => {
    state.sortBy = event.target.value;
    saveData();
    renderTransactions();
  });
  el.spendingLimit.addEventListener('input', (event) => {
    state.spendingLimit = Number(event.target.value) || 0;
    saveData();
    updateBalanceAndLimit();
  });
  el.themeToggle.addEventListener('click', toggleTheme);

  applyTheme();
  renderAll();
}

init();

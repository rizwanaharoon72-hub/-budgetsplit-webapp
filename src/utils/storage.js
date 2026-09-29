const STORAGE_KEYS = {
  SESSION: 'budgetsplit_session',
  PROFILE: 'budgetsplit_profile',
  EXPENSES: 'budgetsplit_expenses',
};

// Safe JSON parse wrapper
function getItem(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

function removeItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

export const storage = {
  // Auth Session
  getAuthSession() {
    return getItem(STORAGE_KEYS.SESSION, null);
  },

  setAuthSession(session) {
    setItem(STORAGE_KEYS.SESSION, session);
  },

  clearAuthSession() {
    removeItem(STORAGE_KEYS.SESSION);
  },

  // User Profile
  getProfile() {
    return getItem(STORAGE_KEYS.PROFILE, null);
  },

  setProfile(profile) {
    setItem(STORAGE_KEYS.PROFILE, profile);
  },

  updateMonthlyIncome(newIncome) {
    const current = this.getProfile() || {};
    const updated = { ...current, monthlyIncome: Number(newIncome) || 0 };
    this.setProfile(updated);
    return updated;
  },

  // Expenses
  getExpenses() {
    return getItem(STORAGE_KEYS.EXPENSES, []);
  },

  addExpense(expenseData) {
    const expenses = this.getExpenses();
    const currentDate = new Date();
    const isoMonth = currentDate.toISOString().slice(0, 7); // "YYYY-MM"
    
    const newExpense = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      title: expenseData.title.trim(),
      amount: Number(expenseData.amount),
      category: expenseData.category, // 'need' | 'want' | 'saving'
      date: expenseData.date || new Date().toISOString(),
      month: expenseData.month || isoMonth,
      createdAt: new Date().toISOString(),
    };

    const updated = [newExpense, ...expenses];
    setItem(STORAGE_KEYS.EXPENSES, updated);
    return newExpense;
  },

  deleteExpense(expenseId) {
    const expenses = this.getExpenses();
    const updated = expenses.filter((item) => item.id !== expenseId);
    setItem(STORAGE_KEYS.EXPENSES, updated);
    return updated;
  },
};

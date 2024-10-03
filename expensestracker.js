const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware to parse incoming requests
app.use(bodyParser.json());

// File to store expenses
const EXPENSES_FILE = './expenses.json';

// Utility function to read expenses from the file
const readExpenses = () => {
  if (fs.existsSync(EXPENSES_FILE)) {
    const data = fs.readFileSync(EXPENSES_FILE);
    return JSON.parse(data);
  }
  return [];
};

// Utility function to write expenses to the file
const writeExpenses = (expenses) => {
  fs.writeFileSync(EXPENSES_FILE, JSON.stringify(expenses, null, 2));
};

// Route to get all expenses
app.get('/expenses', (req, res) => {
  const expenses = readExpenses();
  res.json(expenses);
});

// Route to add a new expense
app.post('/expenses', (req, res) => {
  const expenses = readExpenses();
  const newExpense = {
    id: expenses.length + 1,
    description: req.body.description,
    amount: req.body.amount,
    date: req.body.date, // date format: YYYY-MM-DD
  };
  expenses.push(newExpense);
  writeExpenses(expenses);
  res.status(201).json(newExpense);
});

// Route to get total expenses for a given day
app.get('/expenses/day/:date', (req, res) => {
  const expenses = readExpenses();
  const date = req.params.date;
  const total = expenses
    .filter(expense => expense.date === date)
    .reduce((sum, expense) => sum + expense.amount, 0);
  res.json({ date, total });
});

// Route to get total expenses for a given week (YYYY-WW format)
app.get('/expenses/week/:week', (req, res) => {
  const expenses = readExpenses();
  const week = req.params.week; // format: YYYY-WW (ISO week format)
  
  // Extract year and week number from the week param
  const [year, weekNum] = week.split('-');
  
  // Function to get the start date of a week in ISO format
  const getStartOfWeek = (year, weekNum) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNum - 1) * 7 + (firstDayOfYear.getDay() === 0 ? -6 : 1);
    return new Date(firstDayOfYear.setDate(firstDayOfYear.getDate() + daysOffset));
  };
  
  const startDate = getStartOfWeek(year, weekNum);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  const total = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  res.json({ week, total });
});

// Route to get total expenses for a given month (YYYY-MM format)
app.get('/expenses/month/:month', (req, res) => {
  const expenses = readExpenses();
  const month = req.params.month; // format: YYYY-MM

  const total = expenses
    .filter(expense => expense.date.startsWith(month))
    .reduce((sum, expense) => sum + expense.amount, 0);

  res.json({ month, total });
});

// Start the server
app.listen(port, () => {
  console.log(`Expense Tracker API running at http://localhost:${port}`);
});

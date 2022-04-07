import { nanoid } from 'https://cdn.jsdelivr.net/npm/nanoid/nanoid.js';


// HELPER FUNCTION - pomocne funkcje
const qs = (selector) => document.querySelector(selector);
const qsAll = (selector) => document.querySelectorAll(selector);
const crEl = (elementName) => document.createElement(elementName);

// MODEL/Data - dane aplikacji
const state = { revenues: [], expenses: [] };

//VIEW
const createBtn = (parentElement, textContent, callback, id) => {
  const btn = crEl('button');
  btn.textContent = textContent;
  parentElement.appendChild(btn);
  btn.addEventListener('click', () => callback(id));
};

const createInputs = (parentElem, valueName, valueAmount) => {
  const inputName = crEl('input');
  const inputAmount = crEl('input');
  parentElem.appendChild(inputName);
  parentElem.appendChild(inputAmount);
  inputName.value = `${valueName}`;
  inputAmount.value = `${valueAmount}`;
};

const renderSumBudget = (selector) => {
  let sumBudget = 0;
  
  if (selector === '#sumRevenues') {
    sumBudget = sum(state.revenues);
    qs(selector).innerText = `${sumBudget} zł`;
  } else if (selector === '#sumExpenses') {
    sumBudget = sum(state.expenses);
    qs('#sumExpenses').innerText = `${sumBudget} zł`;
  }
  
  return sumBudget;
};

const renderResult = () => {
  let result = renderSumBudget('#sumRevenues') - renderSumBudget('#sumExpenses');
  if (result > 0) {
    qs('#result').innerText = `Możesz jeszcze wydać ${result} zł`;
  } else if (result === 0) {
   qs('#result').innerText = `Bilans wynosi zero`;
  } else {
    qs('#result').innerText = `Bilnas jest ujemny. Jesteś na minusie ${Math.abs(result)} zł`;
  }
};




const renderBudget = (type, budgetState) => {
  qs(`.${type}_DOM`).innerHTML = '';
  qs(`.${type}_buttons`).innerHTML = '';
  
  budgetState.forEach(({ id, name, amount, isEditable }) => {
    const li = crEl('li');
    const div = crEl('div');
    li.textContent = `${name} - ${amount} zł`;
    
    if (isEditable) {
      li.innerHTML = '';

      createInputs(li, name, amount);

      if (type === 'expenses') {
        createBtn(div, 'Tak', updateExpense, id);
        createBtn(div, 'Nie', toggleExpenseEditable, id);
      } else {
        createBtn(div, 'Tak', updateRevenue, id);
        createBtn(div, 'Nie', toggleRevenueEditable, id);
      }
    } else {
      if (type === 'expenses') {
        createBtn(div, 'Edytuj', toggleExpenseEditable, id);
        createBtn(div, 'Usuń', deleteExpense, id);
      } else {
        createBtn(div, 'Edytuj', toggleRevenueEditable, id);
        createBtn(div, 'Usuń', deleteRevenue, id);
      }
    }

 qs(`.${type}_DOM`).appendChild(li);
 qs(`.${type}_buttons`).appendChild(div);
  });
};

const renderApp = () => {
  renderBudget('revenues', state.revenues);
  renderBudget('expenses', state.expenses);
  renderResult();
};

//UPDATE
const addBudgetItem = (budgeItem, state) => {
  if (budgeItem.budgetItemId === 'revenues') {
    state.revenues = [...state.revenues, budgeItem];
  } else if (budgeItem.budgetItemId === 'expenses') {
    state.expenses = [...state.expenses, budgeItem];
  }
  renderApp();
};

const toggleRevenueEditable = (id) => {
  state.revenues = state.revenues.map((revenue) =>
    revenue.id === id ? { ...revenue, isEditable: !revenue.isEditable } : revenue
  );
  renderApp();
};

const updateRevenue = (id) => {
  const inputs = qsAll('.revenues_DOM input');
  const newName = inputs[0].value;
  const newAmount = inputs[1].value;
  state.revenues = state.revenues.map((revenue) =>
    revenue.id === id
      ? { ...revenue, name: newName, amount: newAmount, isEditable: false }
      : revenue
  );

  renderApp();
};

const deleteRevenue = (revenueId) => {
  state.revenues = state.revenues.filter(({ id }) => id !== revenueId);
  renderApp();
};

const sum = (stateBudget) =>
  stateBudget.reduce((acc, itemState) => acc + Number(itemState.amount), 0);
//expenses
const updateExpense = (id) => {
  const inputs = qsAll('.expenses_DOM input');
  const newName = inputs[0].value;
  const newAmount = inputs[1].value;
  state.expenses = state.expenses.map((expense) =>
    expense.id === id
      ? { ...expense, name: newName, amount: newAmount, isEditable: false }
      : expense
  );

  renderApp();
};

const toggleExpenseEditable = (id) => {
  state.expenses = state.expenses.map((expense) =>
    expense.id === id
      ? { ...expense, isEditable: !expense.isEditable }
      : expense
  );
  renderApp();
};

const deleteExpense = (expenseId) => {
  state.expenses = state.expenses.filter(({ id }) => id !== expenseId);
  renderApp();
};

const createBudgetItem = (type, newItem) => {
  newItem.id = nanoid();
  newItem.budgetItemId = type;
  newItem.isEditable = false;

  addBudgetItem(newItem, state);
};

const addEventListener = (type) => {
  qs(`.${type}_form`).addEventListener('submit', (e) => {
    e.preventDefault();

    const newItem = {
      name: e.currentTarget.elements[0].value,
      amount: e.currentTarget.elements[1].value,
    };

    type === 'revenues'
       ? createBudgetItem('revenues', newItem)
      : createBudgetItem('expenses', newItem);
    e.currentTarget.elements[0].value = '';
    e.currentTarget.elements[1].value = '';
  });
};

addEventListener('revenues');
addEventListener('expenses');
import React from 'react';
import CategoryList from './category_list';
import Category from './category';
import CategoryOverview from './category_overview';
import Overview from './overview';
import ImportModal from './import_modal';
import Confirm from '../confirm';

import {updateBudget} from '../../data/budget';
import {findCategory, importCategory} from '../../data/budget_category';
import {createItem, updateItem, destroyItem} from '../../data/budget_item';
import {createExpense, updateExpense, destroyExpense} from '../../data/budget_item_expense';
import {monthName, selectedValue, title, today} from '../../utils/helpers';

export default class CashFlowPlans extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    showForm: false,
    budget: {
      month: (new Date).getMonth() + 1,
      year: (new Date).getFullYear(),
      budget_categories: [
        {name: 'Charity', id: 0},
        {name: 'Saving'},
        {name: 'Housing'},
        {name: 'Utilities'},
        {name: 'Food'},
        {name: 'Clothing'},
        {name: 'Transportation'},
        {name: 'Medical/Health'},
        {name: 'Insurance'},
        {name: 'Personal'},
        {name: 'Recreation'},
        {name: 'Debts'}
      ]
    },
    category: {
      id: 0,
      name: '',
      amount: '',
      budget_items: []
    },
    importHidden: true,
    modal: {
      hidden: true,
      item: {name: ''},
      index: -1,
      delete: function(){}
    }
  };

  confirmItemDelete = (budget_item, index) => {
    if (!!budget_item.id) {
      this.setState({
        modal: {
          hidden: false,
          item: budget_item,
          index: index,
          delete: this.deleteBudgetItem
        }
      });
    } else {
      this._budgetItemDeleted(index)
    }
  }

  confirmExpenseDelete = (expense, index) => {
    if (!!expense.id) {
      this.setState({
        modal: {
          hidden: false,
          item: expense,
          index: index,
          delete: this.deleteExpense
        }
      });
    } else {
      this._expenseDeleted(expense.budget_item_id, index)
    }
  }

  cancelDelete = (e) => {
    if (e) { e.preventDefault() }
    this.setState({modal: {hidden: true, index: -1, item: {name: ''}, delete: function(){}}});
  }

  urlParams() {
    var pathNames  = window.location.pathname.split('/');
    var yearIndex  = pathNames.length - 2;
    var monthIndex = pathNames.length - 1;
    return {month: pathNames[monthIndex], year: pathNames[yearIndex]};
  }

  incrementMonth(date, number) {
    var year     = date.getFullYear();
    var month    = date.getMonth();
    var newMonth = month + number;
    return new Date(year, newMonth);
  }

  changeMonth = (number) => {
    var currentDate = new Date(this.state.budget.year, this.state.budget.month-1, 1);
    var newDate = this.incrementMonth(currentDate, number);
    this._fetchBudget({year: newDate.getFullYear(), month: newDate.getMonth() + 1});
  }

  changeBudget = () => {
    var year  = selectedValue('#budget_year');
    var month = selectedValue('#budget_month');

    this._fetchBudget({year: year, month: month});
  }

  showForm = (e) => {
    e.preventDefault();
    this.setState({showForm: true});
  }

  componentDidMount = () => {
    let budgetParams = Object.assign({}, this.urlParams(), {id: this.props.id});
    this._fetchBudget(budgetParams);
  }

  _fetchDataDone = (data) => {
    this.setState({
      budget: data.budget,
      category: data.budget_category
    });
    history.pushState({}, 'Budgetal', `/cash-flow-plans/${data.budget.year}/${data.budget.month}`);
    title(`${monthName(data.budget.month)} ${data.budget.year}`);
  }

  _fetchDataFail(message) {
    showMessage(message);
  }

  changeCategory = (id) => {
    this._fetchBudget({
      year: this.state.budget.year,
      month: this.state.budget.month,
      id: id
    })
  }

  _fetchBudget = (data) => {
    var self = this;
    findCategory(data)
      .then((resp) => {
        if (!!resp.errors) {
          self._fetchDataFail(resp.errors);
        } else {
          self._fetchDataDone(resp);
        }
      });
  }

  // Budget Item functions
  saveBudgetItem = (item) => {
    var data = {
      budget_category_id: this.state.category.id,
      budget_item: item
    }
    if (item.id === undefined) {
      createItem(data)
        .done(this._budgetItemSaved.bind(null, item.index))
        .fail(this._saveItemFail.bind(null, item))
    } else {
      updateItem(item)
        .done(this._budgetItemSaved.bind(null, item.index))
        .fail(this._saveItemFail.bind(null, item))
    }
  }

  _budgetItemSaved = (index, budget_item, err) => {
    let category = this.state.category
    let budget = _.assign({}, this.state.budget, budget_item.budget)

    budget_item.budget_item_expenses = category.budget_items[index].budget_item_expenses || []
    category.budget_items[index] = budget_item

    this.setState({category: category, budget: budget})
    showMessage(`Saved ${budget_item.name}`)
  }

  _saveItemFail = (index, xhr, status, err) => {
    let errors = JSON.parse(xhr.responseText).errors
    let category = this.state.category
    _.where(category.budget_items, {'index': index.index})[0].errors = errors
    this.setState({category: category})
  }

  deleteBudgetItem = (e) => {
    e.preventDefault();
    if (this.state.modal.item.id !== undefined) {
      destroyItem(this.state.modal.item.id)
        .done(this._budgetItemDeleted(this.state.modal.index))
        .fail(this._fetchDataFail.bind(null, this.state.modal.item))
    }
  }

  _budgetItemDeleted = (index) => {
    let category = this.state.category
    category.budget_items.splice(index, 1)
    if (this.state.modal.item.id !== undefined) {
      showMessage("Deleted "+this.state.modal.item.name)
    }
    this.setState({category: category})
    this.cancelDelete()
  }

  addBudgetItem = (e) => {
    e.preventDefault()
    var category = this.state.category
    category.budget_items.push({category_id: category.id, amount_budgeted: 0.01})
    this.setState({category: category})
  }

  updateBudgetItem = (index, updatedBudgetItem) => {
    var category = this.state.category
    category.budget_items[index] = updatedBudgetItem
    this.setState({category: category})
  }

  saveBudget = (budget) => {
    var self = this;
    updateBudget(budget)
      .then((resp) => {
        if (!!resp.errors) {
          self._saveBudgetFail(budget, resp.errors);
        } else {
          self._budgetUpdated(resp.budget);
        }
      });
  }

  _saveBudgetFail = (budget, errors) => {
    budget.errors = errors;
    this.setState({budget});
  }

  _budgetUpdated = (budget) => {
    showMessage('Updated Budget');
    this.setState({budget});
  }

  // Budget Item Expense functions
  addExpense = (id) => {
    var category = this.state.category
    var budget_item = _.where(category.budget_items, {'id': id})[0]
    budget_item.budget_item_expenses.push({budget_item_id: id, amount: 0.01, date: today()})
    this.setState({category: category})
  }

  saveExpense = (expense) => {
    if (expense.id === undefined) {
      createExpense(expense)
        .done(this._expenseSaved.bind(null, expense.index))
        .fail(this._saveExpenseFail.bind(null, expense))
    } else {
      updateExpense(expense)
        .done(this._expenseSaved.bind(null, expense.index))
        .fail(this._saveExpenseFail.bind(null, expense))
    }
  }

  _saveExpenseFail = (index, xhr, status, err) => {
    let errors = JSON.parse(xhr.responseText).errors
    let category = this.state.category
    let budget_item = _.where(category.budget_items, {'id': index.budget_item_id})[0]
    _.where(budget_item.budget_item_expenses, {'index': index.index})[0].errors = errors
    this.setState({category: category})
  }

  _expenseSaved = (index, expense, err) => {
    let category = this.state.category
    let budget = _.assign({}, this.state.budget, expense.budget)
    var budget_item = _.where(category.budget_items, {'id': expense.budget_item_id})[0]

    budget_item.budget_item_expenses[index] = expense
    this.setState({category: category, budget: budget})
    showMessage(`Saved ${expense.name}`)
  }

  updateExpense = (index, updatedExpense) => {
    var category    = this.state.category
    var budget_item = _.where(category.budget_items, {'id': updatedExpense.budget_item_id})[0]
    budget_item.budget_item_expenses[index] = updatedExpense
    this.setState({category: category})
  }

  deleteExpense = (e) => {
    e.preventDefault();
    if (this.state.modal.item.id !== undefined) {
      destroyExpense(this.state.modal.item.id)
        .done(this._expenseDeleted(this.state.modal.item.budget_item_id, this.state.modal.index))
        .fail(this._fetchDataFail.bind(null, this.state.modal.item))
    }
  }

  _expenseDeleted = (budget_item_id, index) => {
    let category = this.state.category
    var budget_item = _.where(category.budget_items, {'id': budget_item_id})[0]
    budget_item.budget_item_expenses.splice(index, 1)
    if (this.state.modal.item.id !== undefined) {
      showMessage("Deleted "+this.state.modal.item.name)
    }
    this.setState({category: category})
    this.cancelDelete()
  }

  itemFunctions() {
    return {
      add: this.addBudgetItem,
      save: this.saveBudgetItem,
      update: this.updateBudgetItem,
      delete: this.confirmItemDelete
    }
  }

  expenseFunctions() {
    return {
      add: this.addExpense,
      save: this.saveExpense,
      update: this.updateExpense,
      delete: this.confirmExpenseDelete
    }
  }

  _import = (e) => {
    e.preventDefault();
    var self = this;
    importCategory(this.state.category.id)
      .then((resp) => {
        self.importFinished(resp.imported, resp.message);
      });
  }

  importFinished = (imported_items, message) => {
    var category = this.state.category
    category.budget_items = category.budget_items.concat(imported_items)
    this.setState({category: category})
    showMessage(message)
    this.cancelImport()
  }

  cancelImport = (e) => {
    if (e) { e.preventDefault() }
    this.setState({importHidden: true});
  }

  openImport = (e) => {
    e.preventDefault()
    this.setState({importHidden: false});
  }

  moveBudgetItem = (item_id) => {
    var category    = this.state.category
    var idx = _.findIndex(category.budget_items, function(item) {
      return item.id === parseInt(item_id);
    });
    category.budget_items.splice(idx, 1)
    this.setState({category: category})
  }

  render() {
    return (
      <div>
        <section>
          <CategoryList budget={this.state.budget}
                        moveBudgetItem={this.moveBudgetItem}
                        changeBudget={this.changeBudget}
                        changeMonth={this.changeMonth}
                        currentCategoryId={this.state.category.id}
                        changeCategory={this.changeCategory} />

          <div className='large-10 medium-10 columns hide-for-small-down'>
            <div>
              <Category expenseFunctions={this.expenseFunctions()}
                        itemFunctions={this.itemFunctions()}
                        import={this.openImport}
                        category={this.state.category} />

              <div className='row collapse cash-flow-row overviews'>
                <CategoryOverview category={this.state.category} monthlyIncome={this.state.budget.monthly_income} />
                <Overview budget={this.state.budget} saveBudget={this.saveBudget} />
              </div>
              <ImportModal category={this.state.category}
                           hidden={this.state.importHidden}
                           import={this._import}
                           cancel={this.cancelImport} />
            </div>
          </div>
          <Confirm name={this.state.modal.item.name}
                   hidden={this.state.modal.hidden}
                   cancel={this.cancelDelete}
                   delete={this.state.modal.delete} />
        </section>
        <div className='row'></div>
      </div>
    );
  }
}

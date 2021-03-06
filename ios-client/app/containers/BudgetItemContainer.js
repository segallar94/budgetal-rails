import { connect } from 'react-redux'

import BudgetItem from '../components/BudgetItem'
import { navigatePush, navigateReset } from '../actions/Navigation'
import { deleteBudgetItemExpense } from '../actions/Budgets'
import {find, where} from 'lodash-node'

const mapStateToProps = (state) => {
	const item = state.navigationState.routes[state.navigationState.index].budgetItem;
	const id = item ? item.id : 0;
	const budgetItem = find(state.budgetState.budgetItems, {id})
	const budgetItemExpenses = where(state.budgetState.budgetItemExpenses, {budget_item_id: id});
	return {
		budgetItem,
		budgetItemExpenses,
		scrollsToTop: state.navigationState.index === 2
	}
}

const mapDispatchToProps = (dispatch, ownProps) => {
	return {
    ...ownProps,
		addBudgetItemExpense: (budgetItemExpense) => {
			dispatch(navigatePush({key: 'BudgetItemExpenseForm', title: 'New Expense', budgetItemExpense}))
		},
		editBudgetItemExpense: (budgetItemExpense) => {
			dispatch(navigatePush({key: 'BudgetItemExpenseForm', title: 'Edit Expense', budgetItemExpense}))
		},
		deleteBudgetItemExpense: (budgetItemExpense) => {
			dispatch(deleteBudgetItemExpense(budgetItemExpense));
		}
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(BudgetItem)

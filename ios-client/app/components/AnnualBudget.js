import React, {Component} from 'react'
import {
  Dimensions,
  Image,
  ListView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native'

const {width} = Dimensions.get('window')
const SwipeableListViewDataSource = require('SwipeableListViewDataSource');
import SwipeableListView from 'SwipeableListView';
import DateBar from './DateBar';
import {reduce,where} from 'lodash-node'

import {all} from '../data/AnnualBudgets';
import {assign, findIndex} from 'lodash-node';
import {deleteItem} from '../data/AnnualBudgets';
import {numberToCurrency, dueDate} from '../utils/ViewHelpers';
import ConfirmDeleteButton from './ConfirmDeleteButton';

import StyleSheet from './StyleSheet'
const styles = StyleSheet.create({
  addButtonContainer: {
    paddingTop: 35,
    paddingBottom: 35,
    flex: 1,
    alignItems: 'center',
  },
  addButton: {
    color: '$blue',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '$blue',
    width: 180,
    padding: 4,
    paddingTop: 8
  },
  container: {
    flex: 1,
    backgroundColor: '$backgroundColor',
  },
  crudContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    overflow: 'hidden',
    backgroundColor: '$white',
  },
  button: {
    height: 110,
    width: 100,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  editButton: {
    borderWidth: 1,
    borderColor: '$blue',
    backgroundColor: '$blue',
  },
  editButtonText: {
    color: '$white',
    textAlign: 'center',
  },
  list: {
    backgroundColor: '$backgroundColor',
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    marginTop: 0,
    height: 110,
    backgroundColor: '$backgroundColor',
  },
  itemInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numbersContainer: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: width / 2,
    paddingRight: 14,
  },
  paid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width / 2,
  },
  separator: {
    height: 1,
    backgroundColor: '$graySeparator',
    width: 400
  },
  title: {
    fontSize: 18,
    color: '$darkTitle',
    fontWeight: 'bold',
    padding: 4
  },
  header: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: '$grayBackground',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '$backgroundColor',
    borderBottomColor: '$grayBorder'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '$gray',
    marginTop: 4
  },
  empty: {
    color: '$blue',
    fontWeight: 'bold',
    textAlign: 'center',
    width: 200,
    paddingBottom: 30
  },
  red: {
    color: '$red',
  },
  green: {
    color: '$green',
  },
  blue: {
    color: '$blue',
  },
  subTitle: {
    fontWeight: 'bold'
  },
  amount: {
    fontSize: 16,
    padding: 4,
  },
  amountMonth: {
    padding: 4,
    fontWeight: 'bold',
  },
  nothing: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidLabel: {
    backgroundColor: '$green',
    right: 10,
    position: 'absolute',
    color: 'white',
    padding: 5,
    paddingLeft: 10,
    paddingRight: 10,
    fontWeight: 'bold'
  },
});

class AnnualBudget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDatePicker: false,
    }
  }

  componentDidMount() {
    this._updateBudget(this.props.year);
  }

  _updateBudget = async(year) => {
    try {
      let resp = await all(year);
      if (resp !== null) {
        this.props.updateBudget(resp)
      }
    } catch (err) {
      this.props.signOut();
    }
  }

  crudButtons = (item) => {
    return (
      <View style={styles.crudContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={this.props.editBudgetItem.bind(this,item)}
          underlayColor='blue' >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <ConfirmDeleteButton name={item.name}
                             deleteFunction={this.deleteItem.bind(this, item)} />
      </View>
    )
  }

  deleteItem = async(item) => {
    try {
      let resp = await deleteItem(item.id);
      if (resp.success) {
        this.props.deleteBudgetItem(item);
      }
    } catch (err) {
      this.props.signOut();
    }
  }

  toggleDatePicker = () => {
    this.setState({showDatePicker: !this.state.showDatePicker})
  }

  footerRow = () => {
    const annual_budget_id = this.props.budget ? this.props.budget.id : 0;
    const newBudgetItem = {annual_budget_id};

    return (
      <View style={styles.addButtonContainer}>
        {this._getEmptyMessage()}
        <TouchableOpacity onPress={this.props.addBudgetItem.bind(this,newBudgetItem)}>
          <Text style={styles.addButton}>+ Add a budget item</Text>
        </TouchableOpacity>
      </View>
    )
  }

  _renderRow = (budgetItem: string, sectionID: number, rowID: number) => {
    return (
      <TouchableHighlight key={`annual-item-${sectionID}-${rowID}`}>
        <View style={styles.row}>
          <View style={styles.itemInfo}>
            <Text style={styles.title}>
              {budgetItem.name}
            </Text>
            <Text style={styles.amount}>
              {numberToCurrency(budgetItem.amount)} on {dueDate(budgetItem.due_date)}
            </Text>
            <Text style={styles.amountMonth}>
              {numberToCurrency((budgetItem.amount / 12).toFixed())}/month
            </Text>
          </View>
          <View style={styles.right}>
            <View style={styles.paid}>
              {this._isPaid(budgetItem.paid)}
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  separator(sectionID, rowID) {
    return <View key={`item-sep-${sectionID}-${rowID}`} style={styles.separator} />
  }

  _isPaid(paid) {
    return paid ? <Text style={styles.paidLabel}>Paid</Text> : <View />
  }

  _getEmptyMessage() {
    if (this.props.budgetItems.length === 0) {
      const emptyMessage = `You haven't created any budget items for ${this.props.year} yet!`;
      return (
        <View style={styles.nothing}>
          <Image source={require('image!cash_icon')} />
          <Text style={{textAlign: 'center',padding: 15}}>{emptyMessage}</Text>
        </View>
      );
    }
  }

  onYearChange = (year) => {
    this.props.updateBudgetYear(year)
    this._updateBudget(year)
  }

  render() {
    let ds = new SwipeableListViewDataSource({
      getRowData: (data, sId, rId) => data[sId][rId],
      rowHasChanged: (row1, row2) => row1 !== row2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    const dataBlob = {'budget_items': this.props.budgetItems};
    const budgetItems = ds.cloneWithRowsAndSections(dataBlob);

    return (
      <View style={styles.container}>
        <DateBar type='year'
                 onDateChange={this.onYearChange}
                 showDatePicker={this.state.showDatePicker}
                 beginningYear={2015}
                 endingYear={new Date().getFullYear()+2}
                 year={this.props.year}
                 toggleDatePicker={this.toggleDatePicker} />

        <SwipeableListView style={styles.list}
                  bounceFirstRowOnMount={true}
                  maxSwipeDistance={200}
                  renderQuickActions={this.crudButtons}
                  enableEmptySections={true}
                  initialListSize={this.props.budgetItems.length+1}
                  scrollsToTop={this.props.scrollsToTop}
                  automaticallyAdjustContentInsets={false}
                  dataSource={budgetItems}
                  renderRow={this._renderRow}
                  renderFooter={this.footerRow}
                  renderSeparator={this.separator} />
        </View>
    );
  }
}

module.exports = AnnualBudget;

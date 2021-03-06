import React from 'react';
import classNames from 'classnames';
import InputField from './forms/input_field';
import BudgetItemExpenseListContainer from '../containers/BudgetItemExpenseListContainer';
import { createItem, updateItem, destroyItem } from '../data/BudgetItem';
import {
  addDecimal,
  numberToCurrency,
  prettyServerErrors,
} from '../utils/helpers';
import Confirm from '../utils/confirm';
import { startCase } from 'lodash';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Row,
  Switch,
} from 'antd';
const FormItem = Form.Item;

class BudgetItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  static propTypes = {
    budgetItem: React.PropTypes.object.isRequired,
  };

  componentWillReceiveProps = nextProps => {
    if (this.props.budgetItem.id !== nextProps.budgetItem.id) {
      this.props.form.resetFields();
    }
  };

  updateFromEvent = e => {
    switch (e.target.name) {
      case 'name':
        const updatedItem = Object.assign({}, this.props.budgetItem, {
          [e.target.name]: e.target.value,
        });
        this.props.updateBudgetItem(updatedItem);
        break;
      case 'amount_budgeted':
        this.updateAmount(e.target.value);
        break;
    }
  };

  updateAmount = amount_budgeted => {
    const updatedItem = Object.assign({}, this.props.budgetItem, {
      amount_budgeted: String(amount_budgeted).replace(/\$\s?|(,*)/g, ''),
    });
    this.props.updateBudgetItem(updatedItem);
  };

  persistBudgetItem = async budgetItem => {
    try {
      this.setState({ loading: true });
      const isPersisted = budgetItem.id > 0;
      const strategy = isPersisted ? updateItem : createItem;
      const afterSaveStrategy = isPersisted
        ? this.props.updateBudgetItem
        : this.props.saveBudgetItem;
      const resp = await strategy(budgetItem);

      if (!!resp.errors) {
        showMessage(prettyServerErrors(resp.errors), 'error');
      } else {
        showMessage(`Saved ${resp.name}`);
        afterSaveStrategy(resp);
      }
    } catch (err) {
      apiError(err.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  save = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.persistBudgetItem(this.props.budgetItem);
      }
    });
  };

  deleteBudgetItem = async () => {
    try {
      if (this.props.budgetItem.id !== undefined) {
        const resp = destroyItem(this.props.budgetItem.id);
        if (resp !== null) {
          showMessage('Deleted ' + this.props.budgetItem.name);
        }
      }

      this.props.deleteBudgetItem(this.props.budgetItem);
    } catch (err) {
      apiError(err.message);
    }
  };

  remainingClass(amountRemaining) {
    return classNames({
      'success-color': amountRemaining > 0,
      'alert-color': amountRemaining < 0,
      blue: Math.abs(numberToCurrency(amountRemaining, '')) == 0,
    });
  }

  drag = e => {
    e.dataTransfer.setData('budget_item_id', this.props.budgetItem.id);
    e.dataTransfer.setData(
      'original_category_id',
      this.props.budgetItem.budget_category_id
    );
  };

  getExpensesList(budgetItem, hideExpenses) {
    if (budgetItem.id > 0) {
      const items = hideExpenses
        ? <BudgetItemExpenseListContainer
            key="budget-expenses-list"
            budgetItem={budgetItem}
            budgetItemId={budgetItem.id}
          />
        : null;
      return (
        <CSSTransitionGroup
          component="div"
          transitionName="expense-list"
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          {items}
        </CSSTransitionGroup>
      );
    }
  }

  onDeleteClick = e => {
    e.preventDefault();
    this.props.deleteBudgetItem(this.props.budgetItem);
  };

  handleDeleteClick = e => {
    e.preventDefault();
    Modal.confirm({
      wrapClassName: 'delete-button',
      okText: `Delete ${this.props.budgetItem.name}`,
      cancelText: 'Cancel',
      title: `Delete ${this.props.budgetItem.name}`,
      content: `Are you sure you want to delete ${this.props.budgetItem
        .name}? This cannot be undone.`,
      onOk: () => {
        this.deleteBudgetItem(this.props.budgetItem);
      },
      onCancel() {},
    });
  };

  percentSpent = () => {
    const p =
      this.props.amountSpent / this.props.budgetItem.amount_budgeted * 100;

    if (p > 99.99) {
      return 100;
    }

    if (isNaN(p)) {
      return 0;
    }

    return parseInt(p);
  };

  render() {
    const item = this.props.budgetItem;
    const deleteFunction =
      item.id > 0
        ? this.handleDeleteClick
        : this.props.deleteBudgetItem.bind(this, item);
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        offset: 8,
        span: 16,
      },
    };

    let status;
    if (this.props.amountRemaining < 0) {
      status = 'exception';
    } else if (this.props.amountRemaining === 0.0) {
      status = 'success';
    }

    return (
      <div>
        <Row>
          <Col span={8}>
            <Form
              layout="horizontal"
              onSubmit={this.save}
              onChange={this.updateFromEvent}
            >
              <FormItem {...formItemLayout} label="Name">
                {getFieldDecorator('name', {
                  initialValue: item.name,
                  rules: [
                    {
                      required: true,
                      message: 'Name is required',
                    },
                  ],
                })(<Input name="name" placeholder="Name" />)}
              </FormItem>
              <FormItem {...formItemLayout} label="Amount">
                {getFieldDecorator('amount_budgeted', {
                  initialValue: parseFloat(item.amount_budgeted),
                  rules: [
                    {
                      type: 'number',
                      min: 1,
                      required: true,
                      message: 'Amount is required',
                    },
                  ],
                })(
                  <InputNumber
                    name="amount_budgeted"
                    min={1}
                    placeholder="(1.00)"
                    formatter={value =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    onChange={this.updateAmount}
                  />
                )}
              </FormItem>
              <FormItem {...tailFormItemLayout} className="text-right">
                <Button
                  type="primary"
                  loading={this.state.loading}
                  disabled={this.state.loading}
                  htmlType="submit"
                >
                  Save
                </Button>
              </FormItem>
            </Form>
          </Col>
          <Col span={16}>
            <Row type="flex" justify="center">
              <Col span={8}>
                <div className="text-right">
                  <Progress
                    type="circle"
                    status={status}
                    percent={this.percentSpent()}
                  />
                </div>
              </Col>
              <Col span={12}>
                <p className="text-center">
                  You have spent{' '}
                  <b>{numberToCurrency(this.props.amountSpent)}</b> of{' '}
                  <b>{numberToCurrency(item.amount_budgeted)}</b>.
                </p>
                <p className="text-center">
                  You have <b>
                    {numberToCurrency(this.props.amountRemaining)}
                  </b>{' '}
                  remaining to spend.
                </p>
              </Col>
              <Col span={4} style={{ alignSelf: 'flex-start' }}>
                <Button
                  onClick={deleteFunction}
                  type="primary"
                  className="delete-button right"
                  shape="circle"
                  icon="delete"
                />
              </Col>
            </Row>
          </Col>
        </Row>
        {this.getExpensesList(item, item.id !== undefined)}
      </div>
    );
  }
}

export default Form.create()(BudgetItem);

import React from 'react';
import InputField from '../forms/input_field';
import {numberToCurrency} from '../../utils/helpers';
import _ from 'lodash';

export default class AllocationPlanForm extends React.Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    plan: React.PropTypes.object,
    save: React.PropTypes.func.isRequired,
    update: React.PropTypes.func.isRequired
  }

  update = (plan, event) => {
    var dateFields = ['start_date', 'end_date'];
    if (dateFields.includes(plan)) {
      event = {target: {name: plan, value: event}};
      plan  = this.props.plan;
    }

    plan[event.target.name] = event.target.value;
    var updatedPlan = _.assign({}, this.props.plan, plan)
    this.props.update(updatedPlan);
  }

  save = (e) => {
    e.preventDefault();
    this.props.save(this.props.plan);
  }

  render() {
    var plan = this.props.plan;
    return (
      <form onSubmit={this.save}>
        <div className='row'>
          <div className='large-5 columns start-date'>
            <label htmlFor='start_date'>Start Date</label>
            <InputField type='date' date={plan.start_date} onChange={this.update.bind(null, 'start_date')} name='start_date' errors={plan.errors} />
          </div>
          <div className='large-2 columns centered'><br />TO</div>
          <div className='large-5 columns end-date'>
            <label htmlFor='end_date'>End Date</label>
            <InputField type='date' date={plan.end_date} onChange={this.update.bind(null, 'end_date')} name='end_date' errors={plan.errors} />
          </div>
        </div>
        <div className='row'>
          <div className='large-7 columns'>
            <label htmlFor='income'>Pay Period Income</label>
            <InputField onChange={this.update.bind(this,plan)} required type="number" name='income' defaultValue={numberToCurrency(plan.income,'')} value={plan.income} step='any' min='0.01' placeholder='0.00' errors={plan.errors} />
          </div>
          <div className='large-5 columns text-center'>
            <label>&nbsp;</label>
            <button type='submit' title='Save Plan' className="tiny success button radius">
              <i className='fi-icon fi-check'></i> Save
            </button>
          </div>
        </div>
      </form>
    );
  }
}
import React from 'react';
import {title, currentSession, humanUA, pluralize} from '../../utils/helpers';
import Modal from '../../utils/modal';
import EndSession from './end-session';
import {allSessions, endSession} from '../../data/sessions';
import ChangePassword from './change-password';
import UpdateAccountInfo from './update-account-info';

export default class AccountSettings extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    sessions: {
      expired: [
      ],
      active: [
      ]
    },
    showEndSession: false,
    endSession: {},
    currentTime: (new Date).getTime()
  }

  static contextTypes = {
    history: React.PropTypes.object.isRequired
  }

  componentWillUnmount() {
    window.clearInterval(this.state.intervalId);
  }

  componentDidMount = () => {
    title('Account Settings');
    this._fetchSessions();
    this._startTimer();
  }

  _startTimer = () => {
    let intervalId = setInterval(this.updateTime, 60000);
    this.setState({intervalId});
  }

  updateTime = () => {
    let currentTime = (new Date).getTime();
    this.setState({currentTime});
  }

  _fetchSessions = () => {
    allSessions()
      .then((resp) => {
        this._fetchDataDone(resp);
      })
      .catch(this._fetchDataFail)
  }

  _fetchDataFail = (e) => {
    showMessage(e.message)
    this.context.history.replace('/');
  }

  _fetchDataDone = (data) => {
    this.setState({sessions: data.sessions});
  }

  fullSessionDate(date) {
    let sessionDate = new Date(date);
    return `${sessionDate.toDateString()} at ${sessionDate.toLocaleTimeString()}`;
  }

  sessionDate = (currentTime, date) => {
    let startDate = new Date(date);
    let secs = Math.floor((currentTime - startDate.getTime()) / 1000);
    if (secs < 3600) return `${pluralize(Math.floor(secs / 60), 'minute', 'minutes')} ago`;
    if (secs < 86400) return `${pluralize(Math.floor(secs / 3600), 'hour', 'hours')} ago`;
    if (secs < 604800) return `${pluralize(Math.floor(secs / 86400), 'day', 'days')} ago`;
    return this.fullSessionDate(date);
  }

  endSession = (session) => {
    endSession(session)
      .then((resp) => {
        this.endSessionDone(resp.sessions)
      })
      .catch(this._fetchDataFail)
  }

  endSessionDone(sessions) {
    showMessage('Session Ended');
    this.setState({sessions})
    this.cancelEndSession();
  }

  cancelEndSession = (e) => {
    if (e) { e.preventDefault() }
    this.setState({
      showEndSession: false,
      endSession: {}
    });
  }

  showEndSession = (session, e) => {
    e.preventDefault();
    this.setState({
      showEndSession: true,
      endSession: session
    });
  }

  render() {
    let user       = this.state.user;
    let session    = currentSession();
    let endSession = <EndSession end={this.endSession} session={this.state.endSession} />;
    return (
      <div className='row'>
        <div className='large-7 columns'>
          <UpdateAccountInfo />
        </div>

        <div className='large-5 columns'>
          <ChangePassword />
        </div>

        <div className='large-12 columns header-row'>
          <h3>Sessions</h3>
        </div>
        <div className="small-12 large-12 columns">
          <ul className="main-budget-categories">
            <li>
              <div className='row'>
                <div className="small-12 large-12 columns">
                  <Modal title='End Session' hidden={this.state.showEndSession} cancel={this.cancelEndSession} modalType='alert' modalSize='tiny' content={endSession} />
                  <table>
                    <caption><b>Active Sessions</b></caption>
                    <thead>
                      <tr>
                        <th>Browser</th>
                        <th>Signed in</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr title={`Signed in from ${session.ip}`}>
                        <td>{humanUA(session.user_agent)}</td>
                        <td>{this.sessionDate(this.state.currentTime, session.created_at)}</td>
                        <td>(Current Session)</td>
                      </tr>
                    {
                      this.state.sessions.active.map((session, index) => {
                        let ipTitle = `Signed in from ${session.ip}`;
                        return (
                          <tr key={index} title={ipTitle}>
                            <td>{humanUA(session.user_agent)}</td>
                            <td>{this.sessionDate(this.state.currentTime, session.created_at)}</td>
                            <td><a onClick={this.showEndSession.bind(null, session)} className='tiny alert button radius'>End Session</a></td>
                          </tr>
                        )
                      })
                    }
                    </tbody>
                  </table>
                </div>
              </div>
              <div className='row'>
                <div className="small-12 large-12 columns">
                  <table>
                    <caption><b>Expired Sessions (last 10)</b></caption>
                    <thead>
                      <tr>
                        <th>Browser</th>
                        <th>Signed in</th>
                        <th>Signed out</th>
                      </tr>
                    </thead>
                    <tbody>
                    {
                      this.state.sessions.expired.map((session, index) => {
                        let ipTitle = `Signed in from ${session.ip}`;
                        return (
                          <tr key={index} title={ipTitle}>
                            <td>{humanUA(session.user_agent)}</td>
                            <td>{this.sessionDate(this.state.currentTime, session.created_at)}</td>
                            <td>{this.fullSessionDate(session.expired_at)}</td>
                          </tr>
                        )
                      })
                    }
                    </tbody>
                  </table>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
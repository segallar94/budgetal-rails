import React, {Component} from 'react'
import {
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  View
} from 'react-native'

import StyleSheet from './StyleSheet'

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingLeft: 0,
    paddingRight: 10,
    paddingBottom: 0,
    paddingTop: 0,
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 0
  },
  column: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    marginLeft: '5%',
    marginBottom: 4,
    color: '$menuBackground'
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 100,
    paddingRight: 14
  },
  inputs: {
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    marginBottom: 0,
    padding: 0,
    height: 40,
    borderColor: '$grayBorder',
    backgroundColor: '$white',
    borderWidth: 0,
  },
  textField: {
    textAlign: 'right',
  },
  paidField: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '$red',
  },
});

class FormInput extends Component {
  validateRequired = (value='') => {
    if (this.props.required) {
      return value.trim().length
    } else {
      return true
    }
  }

  validatePassword = (value='') => {
    return value.length > 7;
  }

  confirmPassword = (confirmation, password) => {
    return confirmation === password;
  }

  format(format='', value='') {
    switch(format) {
      case 'switch':
        return value;
      case 'number':
        return value.replace(/[^\d*\.\d{2}]/g, '');
      default:
        return String(value);
    }
  }

  onChangeText = (value) => {
    const formattedValue = this.format(this.props.format, value);
    this.props.onChangeText(formattedValue);
  }

  textInput = (props) => {
    let knownProps = Object.assign({}, this.props, {})
    delete knownProps.password
    return (
      <TextInput {...knownProps}
               {...props}
               onChangeText={this.onChangeText}
               selectionColor='#6699FF'
               style={[styles.inputs, styles.textField]} />
    );
  }

  switchInput = () => {
    return (
      <View style={[styles.inputs, styles.paidField]}>
        <Switch {...this.props} onTintColor={'#6699ff'} />
      </View>
    )
  }

  _getInputType(type) {
    switch (type) {
      case 'switch':
        return this.switchInput();
      case 'password':
        return this.textInput({secureTextEntry: true, keyboardAppearance: 'dark'});
      default:
        return this.textInput();
    }
  }

  render() {
    const formattedValue = this.format(this.props.format, this.props.value);
    let validStyles = this.validateRequired(formattedValue) ? {} : styles.error;
    if (this.props.format === 'password') {
      validStyles = this.validatePassword(formattedValue) ? validStyles : styles.error;
    }

    if (this.props.format === 'password_confirmation') {
      validStyles = this.confirmPassword(formattedValue, this.props.password) ? validStyles : styles.error;
    }

    return (
      <View style={styles.inputRow}>
        <View style={styles.column}>
          <Text style={[styles.label,validStyles]}>{this.props.label}</Text>
        </View>
        <View style={styles.right}>
          {this._getInputType(this.props.inputType)}
        </View>
      </View>
    )
  }
}

module.exports = FormInput;

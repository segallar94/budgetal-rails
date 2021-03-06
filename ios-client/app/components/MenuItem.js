import React, {
  Component,
} from 'react';

import {
  Dimensions,
  Image,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import StyleSheet from './StyleSheet';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  separator: {
    borderBottomColor: '$grayBorder',
    borderBottomWidth: 0.5,
  },
  text: {
    color: '$white',
    fontSize: 16,
  },
  image: {
    width: 28,
    height: 28,
    marginRight: 10,
  }
});

class MenuItem extends Component {
  _renderSeparator(text) {
    if (text !== 'Sign Out') {
      return <View style={styles.separator} />
    }
  }

  render() {
    return (
      <View>
        <TouchableHighlight underlayColor={'#222222'} onPress={this.props.onPress} accessible={true} accessibilityLabel={this.props.text}>
          <View style={styles.container}>
            <Image source={this.props.image} style={styles.image} />
            <Text style={styles.text}>{this.props.text}</Text>
          </View>
        </TouchableHighlight>
        {this._renderSeparator(this.props.text)}
      </View>
    );
  }
};

module.exports = MenuItem;

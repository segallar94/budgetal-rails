'use strict';

var React = require('react-native');
var { StyleSheet } = React;

module.exports = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  instructions: {
    textAlign: 'left',
    color: '#333',
    marginBottom: 5,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  base64: {
    borderRadius: 75,
    height: 150,
    width: 150,
    borderColor: '#69F',
    borderWidth: 3,
    resizeMode: 'contain'
  }
});


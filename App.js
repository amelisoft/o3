/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { StackNavigator } from 'react-navigation';
import HomeScreen from './Homepage';

import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

const RootStack = StackNavigator({
  Home: {
    screen: HomeScreen,
  }
},
{
  headerMode: 'none'
});

export default class App extends Component{
  render() {
    return (<RootStack />);
  }
}
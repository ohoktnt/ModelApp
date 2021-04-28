import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Button} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';

export default class App extends Component {
  render() {
    return(
      <LinearGradient 
        colors={['#fffc00', '#ffff70']} 
        style={styles.linearGradient}></LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1
  },
});
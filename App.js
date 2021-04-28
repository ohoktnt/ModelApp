import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Button} from 'react-native-elements';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const mobile = "MobileNet";
const ssd = "SSD MobileNet";
const yolo = "Tiny YOLOv2";
const deeplab = "Deeplab";
const posenet = "PoseNet";

export default class App extends Component {
  render() {

    var renderButton = (m) => {
      return(
        <Button title={m} buttonStyle={styles.button}></Button>
      )
    }

    return(
      <LinearGradient 
        colors={['#fffc00', '#ffff70']} 
        style={styles.linearGradient}>
          <View>
            {renderButton(mobile)}
            {renderButton(ssd)}
            {renderButton(yolo)}
            {renderButton(deeplab)}
            {renderButton(posenet)}
          </View>
        </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  button: {
    backgroundColor: 'black',
    width: 200,
    height: 50,
    margin:5,
  }
});
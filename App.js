import React, {Component} from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';
import {Button} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Tflite from 'tflite-react-native';
import Imagepicker from 'react-native-image-picker';
// 2.3.0 version bc image that the user picks, that image is stored
// in cache. newer versions dont give the option to easily access the path 

// configure tflite for project - allows use to start using the tflite functions
let tflite = new Tflite();

const mobile = "MobileNet";
const ssd = "SSD MobileNet";
const yolo = "Tiny YOLOv2";
const deeplab = "Deeplab";
const posenet = "PoseNet";

const height = 300;
const width = 300;

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      model: null,
      source: null, // to store the image the user selected
      imageHeight: height,
      imageWidth: width,
      recognitions: [],
    }
  }

  onSelectImage() {
    const options ={};
    Imagepicker.launchImageLibrary(options, (response) => {
      // error checking
      if(response.didCancel) {
        console.log("User cancelled Image Picker");
      } else if (response.error) {
         console.log('Error');
      } else if (response.customButton) {
          console.log('User clicked custom button');
      } else {
        var path = response.path;
        console.log('Camera Opened');
        this.setState({
          //update state to selected photo
          source: {uri: response.uri},
        });
        switch(this.state.model) {
          case ssd:
            tflite.detectObjectOnImage({
              path: path,
              threshold: 0.2,//preprocessing state to make it a little faster
              numResultsPerClass: 1
            }, (err, res) => {
              if(err) console.log(err);
              else {
                console.log(res);
                this.setState({recognitions: res});
              }
            })
            break;
          case yolo:
            tflite.detectObjectOnImage({
              path: path,
              model: 'YOLO',
              imageMean: 0.0,
              imageStd: 255,
              threshold: 0.4,
              numResultsPerClass: 1,
            }, (err, res) => {
              if(err) console.log(err)
              else {
                console.log(res);
                this.setState({recognitions: res});
              }
            })
            break;
          case deeplab:
            tflite.runSegmentationOnImage({
              path: path,
            }, (err, res) => {
              if(err) console.log(err)
              else {
                console.log(res);
                this.setState({recognitions: res});
              }
            })
            break;
          case posenet:
            tflite.runPoseNetOnImage({
              path: path,
              threshold: 0.8,
            }, (err, res) => {
              if(err) console.log(err)
              else {
                console.log(res);
                this.setState({recognitions: res});
              }
            })
            break;
          default:
            tflite.runModelOnImage({
              path: path,
              imageMean: 128.0,
              imageStd: 128.0,
              numResults: 3,
              threshold: 0.05,
            }, (err, res) => {
              if(err) console.log(err)
              else {
                console.log(res);
                this.setState({recognitions: res});
              }
            })
        }
      }
    })
  }

  onSelectModel(model) {
    this.setState({model});

    // select model based on click
    switch(model) {
      case ssd:
        var modelFile = 'models/ssd_mobilenet.tflite';
        var labelsFile = 'models/ssd_mobilenet.txt';
        break;
      case yolo:
        var modelFile = 'models/yolov2_tiny.tflite';
        var labelsFile = 'models/yolov2_tiny.txt';
        break;
      case deeplab:
        var modelFile = 'models/deeplabv3_257_mv_gpu.tflite';
        var labelsFile = 'models/deeplabv3_257_mv_gpu.txt';
        break;
      case posenet:
        var modelFile = 'models/posenet_mv1_075_float_from_checkpoints.tflite';
        var labelsFile = '';
        break;
      default:
        var modelFile = 'models/mobilenet_v1_1.0_224.tflite';
        var labelsFile = 'models/mobilenet_v1_1.0_224.txt';
    }
    // input the model and label file into the load model method for tflite
    tflite.loadModel({
        model: modelFile,
        labels: labelsFile,
      },
      // callback function
      (err, res) => {
        if (err) console.log(err)
        else console.log(res)
      });
  }

  goBack() {
    this.setState({model: null});
    this.setState({source: null});
    this.setState({recognitions: []});
    
  }

  renderResults() {
    const {model, recognitions, imageHeight, imageWidth} = this.state;
    switch(model) {
      case ssd: // same as yolo 
      case yolo: 
        console.log(recognitions);
        return recognitions.map((res, id) => {
          // create the squares around the detected objects
          var left = res['rect']['x'] * imageWidth;
          var top = res['rect']['y'] * imageHeight;
          var width = res['rect']['w'] * imageWidth;
          var height = res['rect']['h'] * imageHeight;
          return(
            <View key={id}
            style={[styles.box, {top, left, width, height}]}>
              <Text style={{color: 'white', backgroundColor: 'red'}}>{res['detectedClass'] + ' ' + (res['confidenceInClass']*100).toFixed(0) + '%'}</Text>
            </View>
          )
        })
      case deeplab:
        var base64image = `data:image/png;base64,${recognitions}`;
        return recognitions.length > 0 ? (
          <View>
            <Image 
              source={{uri: base64image}} 
              style={styles.imageOutput}>
            </Image>
          </View>
        ) : undefined;
      case posenet:
        // wants to put a dot whenever there is a pose
        console.log(recognitions);
        return recognitions.map((res, id) => {
          console.log(res);
          return Object.values(res['keypoints']).map((k, idx) => {
            var left = k['x'] * imageWidth;
            var top = k['y'] * imageHeight;
            var width = imageWidth;
            var height = imageHeight;
            return (
              <View key={idx} style={{position: 'absolute', top, left, width, height}}>
                <Text style={{color: 'blue', fontSize: 12}}>{'•'}</Text>
              </View>
            )
          })
        })

    }
  }

  render() {
    const {model, source} = this.state;

    var renderButton = (m) => {
      return(
        <Button 
          title={m} 
          buttonStyle={styles.button} 
          onPress={this.onSelectModel.bind(this, m)}>
        </Button>
      )
    }

    return(
      <LinearGradient 
        colors={['#fffc00', '#ffff70']} 
        style={styles.linearGradient}>
          {model ? (
            <View>
              {<Icon.Button name="undo" onPress={this.goBack.bind(this)}></Icon.Button>}
              { source ? (
                  <View>
                    {<Image source={source} style={styles.imageOutput}></Image>}
                    {this.renderResults()}
                  </View>
                ) : (             
                  <Button 
                    title="Get Image" 
                    buttonStyle={styles.button}
                    onPress={this.onSelectImage.bind(this)}>
                  </Button>)}

            </View>
          ) : (
            <View>
              {renderButton(mobile)}
              {renderButton(ssd)}
              {renderButton(yolo)}
              {renderButton(deeplab)}
              {renderButton(posenet)}
            </View>)}
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
  },
  imageOutput: {
    height: height,
    width: width,
    marginTop: 10,
  },
  box: {
    position: 'absolute',
    borderColor: 'red',
    borderWidth: 2,
  }
});
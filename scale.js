import { Dimensions } from 'react-native';
import DeviceInfo from 'react-native-device-info';


const { width, height } = Dimensions.get("window");

//Guideline sizes are based on standard ~5" screen mobile device
const guidelineBaseWidth = 450;
const guidelineBaseHeight = 780;

const scale = size => width / guidelineBaseWidth * size;
const verticalScale = size => height / guidelineBaseHeight * size;
const moderateScale = (size, factor = 0.4) => DeviceInfo.isTablet()?  (size + ( scale(size) - size ) * factor) : size;

var myDimensions = { width: DeviceInfo.isTablet()? (width - 300): width, height: height}; 

export {scale, verticalScale, moderateScale, myDimensions};
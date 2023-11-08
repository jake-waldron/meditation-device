import gpio from "array-gpio";
import { meditationDurations } from "../utils.js";
import playMp3RaspPi from "./audioFunctions.js";

let audioPlaying = false;

const button = gpio.setInput(40);
button.setR("pu");
let currentButtonState = null;
let lastButtonState = true;
let longPressState = false;
let releasingLongPress = false;
let timer = null;
const longPressTime = 500;

const lengthDisplayPins = { pin : [ 38, 37, 36, 35, 33 ] };
const lengthDisplay = gpio.setOutput(lengthDisplayPins);

let lengthPosition = 0;

async function buttonHandler(state) {
    currentButtonState = state;

    if ( currentButtonState !== lastButtonState ) {
        // button pushed
        if ( currentButtonState === false ) {
            handleButtonPushed();
            // button released
        } else if ( currentButtonState === true ) {
            handleButtonReleased();
        }
    }
    lastButtonState = currentButtonState;
}

function turnOnCurrentLength(lengthPosition) {
    lengthDisplay.forEach((pin, index) => {
        if ( index === lengthPosition ) {
            pin.on();
        } else {
            pin.off();
        }
    });
}

function turnOffLengthDisplay() {
    lengthDisplay.forEach((pin) => {
        pin.off();
    });
}

function handleButtonPushed() {
    if ( longPressState === true ) { // if inside long press state
        lengthPosition < meditationDurations.length - 1 ? lengthPosition++ : lengthPosition = 0;
    } else { // regular press
        // this is *every* button push, including long press
        // so don't put something here if you don't want it to run on long press
    }

    // timer gets cleared on every button release, if it runs, enter/exit long press state
    timer = setTimeout(() => {
        longPressState = !longPressState;
        if ( longPressState === true ) { // when entering long press state, turn on the length display
            turnOnCurrentLength(lengthPosition);
        } else { // when exiting, make sure all length pins are off, and negate the lengthPosition change from that push
            turnOffLengthDisplay();
            lengthPosition <= 0 ? lengthPosition = meditationDurations.length - 1 : lengthPosition--;
            releasingLongPress = true;
        }
    }, longPressTime);
}

function handleButtonReleased() {
    if ( longPressState && !releasingLongPress ) { // button released inside long press
        turnOnCurrentLength(lengthPosition);
    }
    if ( releasingLongPress ) { // button released after exiting long press
        releasingLongPress = false;
    } else if ( !longPressState && !releasingLongPress ) {
        console.log(`Start ${meditationDurations[lengthPosition]} Meditation`);
        if ( audioPlaying === false ) {
            audioPlaying = true;
            turnOnCurrentLength(lengthPosition);
            playMp3RaspPi(`./audio/${meditationDurations[lengthPosition]}.mp3`)
                .then(() => {
                    audioPlaying = false;
                    turnOffLengthDisplay();
                })
                .catch((error) => {
                    console.log(error);
                    audioPlaying = false;
                    turnOffLengthDisplay();
                });
        }
    }
    clearTimeout(timer);
}

//isSelectingLength = false;
// if selecting length = false - regular button push handling
// short press - start meditation
// long press - start selecting length
// if selecting length = true - length button push handling
// short press - select next length
// long press - exit selecting length
// if playing = true - button push handling
// short press - pause
// long press - stop
//handle buttom push
//

export default function setupPi() {
    button.watch(buttonHandler);
}
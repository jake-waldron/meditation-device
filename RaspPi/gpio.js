import gpio from "array-gpio";

let audioPlaying = false;

const button = gpio.setInput(3);
button.setR("pu");
let currentButtonState;
let lastButtonState = true;
let longPressState = false;
let releasingLongPress = false;
let pushedTime;
let timer;
const longPressTime = 1000;

const led = gpio.setOutput(8);
const longPressLED = gpio.setOutput(40);

const lengthDisplayPins = { pin : [ 38, 37, 36, 35, 33 ] };
const lengthDisplay = gpio.setOutput(lengthDisplayPins);

let lengthPosition = 0;
const lengths = [ "3min", "5min", "10min", "15min", "20min" ];


async function buttonHandler(state) {
    currentButtonState = state;
    pushedTime = Date.now();

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
        lengthPosition < lengths.length - 1 ? lengthPosition++ : lengthPosition = 0;
    } else { // regular press
        led.on();
        lengthDisplay[lengthPosition].on();
    }

    // timer gets cleared on every button release, if it runs, enter/exit long press state
    timer = setTimeout(() => {
        longPressState = !longPressState;
        longPressLED.write(longPressState);
        if ( longPressState === true ) { // when entering long press state, turn on the length display
            console.log("Select Length");
            turnOnCurrentLength(lengthPosition);
        } else { // when exiting, make sure all length pins are off, and negate the lengthPosition change from that push
            turnOffLengthDisplay();
            lengthPosition <= 0 ? lengthPosition = lengths.length - 1 : lengthPosition--;
            releasingLongPress = true;
            console.log(`Current Length: ${lengths[lengthPosition]}`);
        }
    }, longPressTime);
}

function handleButtonReleased() {
    if ( longPressState && !releasingLongPress ) { // button released inside long press
        // lengthPosition < lengths.length - 1 ? lengthPosition++ : lengthPosition = 0;
        console.log(`Set to: ${lengths[lengthPosition]}`);
        turnOnCurrentLength(lengthPosition);
    }
    if ( releasingLongPress ) { // button released after exiting long press
        releasingLongPress = false;
    } else if ( !longPressState && !releasingLongPress ) {
        console.log(`Start ${lengths[lengthPosition]} Meditation`);
        // if ( audioPlaying === false ) {
        //     audioPlaying = true;
        //     playMp3RaspPi(`./audio/${lengths[lengthPosition]}.mp3`)
        //         .then(() => {
        //             audioPlaying = false;
        //         })
        //         .catch((error) => {
        //             console.log(error);
        //             audioPlaying = false;
        //         });
        // }
    }
    led.off();
    lengthDisplay[lengthPosition].off();
    clearTimeout(timer);
}

export default function setupPi() {
    button.watch(buttonHandler);
}
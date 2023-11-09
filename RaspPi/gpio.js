import gpio from "array-gpio";
import { meditationDurations } from "../utils.js";
import { turnOffLengthDisplay, turnOnCurrentLength } from "./ledUtils.js";


const button = gpio.setInput(40);
button.setR("pu");
let currentButtonState = null;
let lastButtonState = true;

let deviceState = "idle";

let lastPressWasLong = false;

let timer = null;
const longPressTime = 500;

const lengthDisplayPins = { pin : [ 38, 37, 36, 35, 33 ] };
const lengthDisplay = gpio.setOutput(lengthDisplayPins);
let lengthPosition = 0;


async function buttonHandler(state) {
    currentButtonState = state;

    if ( currentButtonState !== lastButtonState ) {
        switch (deviceState) {
            case "idle": {
                function onShortPress() {
                    startPlayingMeditation();
                }

                function onLongPress() {
                    turnOnCurrentLength(lengthDisplay, lengthPosition);
                    deviceState = "selectingLength";
                }

                handleButton(currentButtonState, onShortPress, onLongPress);
                break;
            }

            case "selectingLength": {
                function onShortPress() {
                    lengthPosition < meditationDurations.length - 1 ? lengthPosition++ : lengthPosition = 0;
                    turnOnCurrentLength(lengthDisplay, lengthPosition);
                }

                function onLongPress() {
                    turnOffLengthDisplay(lengthDisplay);
                    lengthPosition <= 0 ? lengthPosition = meditationDurations.length - 1 : lengthPosition--;
                    deviceState = "idle";
                }

                handleButton(currentButtonState, onShortPress, onLongPress);
                break;
            }


            case "playing": {
                function onShortPress() {
                    // pause
                    console.log("PAUSE");
                    deviceState = "paused";
                }

                function onLongPress() {
                    // stop
                    console.log("STOP");
                    deviceState = "idle";
                }

                handleButton(currentButtonState, onShortPress, onLongPress);
                break;
            }


            case "paused": {
                function onShortPress() {
                    // resume
                    console.log("RESUME");
                    deviceState = "playing";
                }

                function onLongPress() {
                    // stop
                    console.log("STOP");
                    deviceState = "idle";
                }

                handleButton(currentButtonState, onShortPress, onLongPress);
                break;
            }

        }
    }
    lastButtonState = currentButtonState;
}

function handleButton(currentButtonState, short, long) {
    if ( currentButtonState === false ) { // button pushed
        timer = setTimeout(() => {
            // if it runs, it's a long press. do long press stuff. tell the button handler that the last press was a long press
            long();
            lastPressWasLong = true;
        }, longPressTime);

    } else if ( currentButtonState === true ) {   // button released
        clearTimeout(timer); // clear the timer, if it hasn't run yet, it won't
        if ( lastPressWasLong ) { // if the last press was a long press, don't do short press stuff
            lastPressWasLong = false;
            return;
        }
        // if it runs, it's a short press. do short press stuff
        short();
    }
}


function startPlayingMeditation() {
    console.log(`Start ${meditationDurations[lengthPosition]} Meditation`);
    // if ( audioPlaying === false ) {
    //     audioPlaying = true;
    //     turnOnCurrentLength(lengthPosition);
    //     playMp3RaspPi(`./audio/${meditationDurations[lengthPosition]}.mp3`)
    //         .then(() => {
    //             audioPlaying = false;
    //             turnOffLengthDisplay(lengthDisplay);
    //         })
    //         .catch((error) => {
    //             console.log(error);
    //             audioPlaying = false;
    //             turnOffLengthDisplay(lengthDisplay);
    //         });
    // }
}


export default function setupPi() {
    button.watch(buttonHandler);
}
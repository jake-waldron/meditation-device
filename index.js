import gpio from "array-gpio";
import dotenv from "dotenv";
import playMP3 from "./audio.js";

dotenv.config();

// ---------------	Setup	----------------
/*
try {
    removeMp3Files();
    const bearerToken = await getAuth();
    await downloadTodaysMeditations(bearerToken);
} catch (error) {
    console.log(error);
}

schedule("0 0 * * *", async () => {
    removeMp3Files();
    const bearerToken = await getAuth();
    await downloadTodaysMeditations(bearerToken);
});
*/

const system = process.platform === "darwin" ? "macOS" : "raspPi";

// -------------- Raspberry Pi Stuff ----------------

let audioPlaying = false;

if ( system === "raspPi" ) {
    // set up the button
    const button = gpio.setInput(3);
    button.setR("pu");
    const led = gpio.setOutput(8);
    const longPressLED = gpio.setOutput(40);
    const lengthDisplayPins = { pin : [ 38, 37, 36, 35, 33 ] };
    const lengthDisplay = gpio.setOutput(lengthDisplayPins);

    const longPressTime = 1000;

    const lengths = [ "3min", "5min", "10min", "15min", "20min" ];
    let lengthPosition = 0;

    let currentButtonState;
    let lastButtonState = true;
    let pushedTime;

    let timer;

    let longPressState = false;
    let releasingLongPress = false;

    button.watch(async (state) => {
        currentButtonState = state;
        pushedTime = Date.now();

        if ( currentButtonState !== lastButtonState ) {

            // button pushed
            if ( currentButtonState === false ) {

                if ( longPressState === true ) { // if inside long press state
                    lengthPosition < lengths.length - 1 ? lengthPosition++ : lengthPosition = 0;

                } else { // regular press
                    led.on();


                }

                timer = setTimeout(() => {
                    console.log("Select Length");
                    if ( longPressState === true ) {
                        // if exiting long press, negate the position change from that push
                        lengthPosition <= 0 ? lengthPosition = lengths.length - 1 : lengthPosition--;
                        releasingLongPress = true;
                    }
                    longPressState = !longPressState;
                    longPressLED.write(longPressState);
                    if ( longPressState === true ) { // when entering long press state, turn on the length display
                        lengthDisplay.forEach((pin, index) => {
                            if ( index === lengthPosition ) {
                                pin.on();
                            } else {
                                pin.off();
                            }
                        });
                    } else { // make sure all length pins are off
                        lengthDisplay.forEach((pin) => {
                            pin.off();
                        });
                    }

                    console.log(`Current Length: ${lengths[lengthPosition]}`);
                }, longPressTime);

                // button released
            } else if ( currentButtonState === true ) {
                if ( longPressState && !releasingLongPress ) { // button released inside long press
                    // lengthPosition < lengths.length - 1 ? lengthPosition++ : lengthPosition = 0;
                    console.log(`Set to: ${lengths[lengthPosition]}`);
                    lengthDisplay.forEach((pin, index) => {
                        if ( index === lengthPosition ) {
                            pin.on();
                        } else {
                            pin.off();
                        }
                    });
                }
                if ( releasingLongPress ) {
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
                clearTimeout(timer);
            }
        }

        lastButtonState = currentButtonState;
    });
}

// -------------- Mac Stuff ----------------

if ( system === "macOS" ) {
    playMP3("./audio/10min.mp3");
}




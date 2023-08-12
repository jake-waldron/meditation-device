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
    const button = gpio.setInput(37);
    button.setR("pu");
    const led = gpio.setOutput(8);
    const longPressLED = gpio.setOutput(35);

    const longPressTime = 2000;

    let currentButtonState;
    let lastButtonState = true;
    let pushedTime;

    let timer;

    let longPressState = false;

    button.watch(async (state) => {
        currentButtonState = state;
        pushedTime = Date.now();

        if ( currentButtonState !== lastButtonState ) {
            // if button pushed
            if ( currentButtonState === false ) {

                // ------ Long Press Handler ------
                if ( longPressState === true ) {
                    console.log("button pushed in long press");
                } else {
                    // regular press
                    led.on();
                    console.log("button pressed");
                }

                timer = setTimeout(() => {
                    console.log("long press");
                    longPressState = !longPressState;
                    longPressLED.write(longPressState);
                }, longPressTime);
            }
                // if ( state === false && audioPlaying === false ) {
                //     audioPlaying = true;
                //     playMp3RaspPi("./audio/10min.mp3")
                //         .then(() => {
                //             audioPlaying = false;
                //         })
                //         .catch((error) => {
                //             console.log(error);
                //             audioPlaying = false;
                //         });
            // }
            else if ( currentButtonState === true ) {
                console.log("button released");
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




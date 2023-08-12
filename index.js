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

    const lengths = [ "3min", "5min", "10min", "15min", "20min" ];
    let lengthPosition = 0;

    let currentButtonState;
    let lastButtonState = true;
    let pushedTime;

    let timer;

    let longPressState = false;
    let shortPressState = true;

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
                    console.log(`Current Length: ${lengths[lengthPosition]}`);
                    // if ( audioPlaying === false ) {
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
                }

                timer = setTimeout(() => {
                    console.log("Select Length");
                    if ( longPressState === true ) {
                        // if exiting long press, negate the position change from that push
                        lengthPosition <= 0 ? lengthPosition = lengths.length - 1 : lengthPosition--;
                    }
                    longPressState = !longPressState;
                    shortPressState = !shortPressState;
                    longPressLED.write(longPressState);
                    console.log(`Meditation Length: ${lengths[lengthPosition]}`);
                }, longPressTime);

                // button released
            } else if ( currentButtonState === true ) {
                if ( longPressState === true ) { // button released inside long press
                    console.log(`Set to: ${lengths[lengthPosition]}`);
                } else if ( shortPressState === true ) {
                    console.log(`Start ${lengths[lengthPosition]} Meditation`);
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




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
    let button = gpio.setInput(37);
    button.setR("pu");
    const led = gpio.setOutput(8);

    let currentButtonState;
    let lastButtonState = true;
    let buttonPressed = false;
    let pushedTime;

    let timer;

    button.watch(async (state) => {
        currentButtonState = state;
        pushedTime = Date.now();

        if ( currentButtonState !== lastButtonState ) {
            if ( currentButtonState === false ) {
                buttonPressed = true;
                led.on();
                console.log("button pressed");

                timer = setTimeout(() => {
                    console.log("long press");
                }, 5000);
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
                buttonPressed = false;
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




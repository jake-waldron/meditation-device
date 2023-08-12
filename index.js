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

    let lastButtonState = true;
    let currentButtonState;

    button.watch(async (state) => {
        currentButtonState = state;
        let pushedTime = Date.now();

        if ( currentButtonState !== lastButtonState ) {
            if ( currentButtonState === false ) {
                led.on();
                console.log("button pressed");

                while (currentButtonState === false) {
                    button.read((state) => {
                        currentButtonState = state;
                        if ( state === true ) break;
                    });
                    if ( Date.now() - pushedTime > 5000 ) {
                        console.log("long press");
                    }
                }
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
            }
        }
        lastButtonState = currentButtonState;
    });
}

// -------------- Mac Stuff ----------------

if ( system === "macOS" ) {
    playMP3("./audio/10min.mp3");
}




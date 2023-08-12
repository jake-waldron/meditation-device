import downloadTodaysMeditations from "./download.js";
import gpio from "array-gpio";
import dotenv from "dotenv";
import { schedule } from "node-cron";
import playMP3 from "./audio.js";
import getAuth from "./auth.js";
import { removeMp3Files } from "./utils.js";

dotenv.config();

// ---------------	Setup	----------------

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

const system = process.platform === "darwin" ? "macOS" : "raspPi";

// -------------- Raspberry Pi Stuff ----------------

let audioPlaying = false;

if ( system === "raspPi" ) {
    // set up the button
    let button = gpio.setInput(37);
    button.setR("pu");
    const led = gpio.setOutput(8);

    let lastButtonState = true;

    button.watch(async (state) => {
        if ( state !== lastButtonState ) {
            if ( state === false ) {
                led.on();
                console.log("button pressed");
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
        } else if ( state === true ) {
            led.off();
        }
        lastButtonState = state;
    });
}

// -------------- Mac Stuff ----------------

if ( system === "macOS" ) {
    playMP3("./audio/10min.mp3");
}




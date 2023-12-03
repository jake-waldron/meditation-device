import dotenv from "dotenv";
import playMP3 from "./audio.js";
import setupPi from "./RaspPi/gpio.js";
import { removeMp3Files } from "./utils.js";
import getAuth from "./auth.js";
import downloadTodaysMeditations from "./download.js";
import { schedule } from "node-cron";
import { init, turnOnDisplay } from "./RaspPi/led.js";

dotenv.config();

// ---------------	Setup	----------------

try {
    removeMp3Files();
    const bearerToken = await getAuth();
    await downloadTodaysMeditations(bearerToken);
    init();
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

if ( system === "raspPi" ) {
    setupPi();
    turnOnDisplay();
}

// -------------- Mac Stuff ----------------

if ( system === "macOS" ) {
    playMP3("./audio/10min.mp3");
}




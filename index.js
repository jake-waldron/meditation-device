import dotenv from "dotenv";
import playMP3 from "./audio.js";
import setupPi from "./RaspPi/gpio.js";

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

if ( system === "raspPi" ) {
    setupPi();
}

// -------------- Mac Stuff ----------------

if ( system === "macOS" ) {
    playMP3("./audio/10min.mp3");
}




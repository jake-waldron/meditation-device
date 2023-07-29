import downloadTodaysMeditations from './download.js';
import gpio from 'array-gpio';
import dotenv from 'dotenv';
import { schedule } from 'node-cron';

import playMp3RaspPi from './raspPi.js';
import playMP3 from './audio.js';
import getAuth from './auth.js';
import { removeMp3Files } from './utils.js';

dotenv.config();

// ---------------	On Startup	----------------

try {
	removeMp3Files();
	const bearerToken = await getAuth();
	await downloadTodaysMeditations(bearerToken);
} catch (error) {
	console.log(error);
}

schedule('0 0 * * *', async () => {
	removeMp3Files();
	const bearerToken = await getAuth();
	await downloadTodaysMeditations(bearerToken);
});

// ---------------	End On Startup	----------------

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';

// -------------- Raspberry Pi Stuff ----------------

let audioPlaying = false;

if (system === 'raspPi') {
	// set up the button
	let button = gpio.setInput(37);
	button.setR('pu');

	let lastButtonState = true;

	button.watch(async (state) => {
		if (state !== lastButtonState) {
			if (state === false && audioPlaying === false) {
				audioPlaying = true;
				playMp3RaspPi('./audio/10min.mp3')
					.then(() => {
						audioPlaying = false;
					})
					.catch((error) => {
						console.log(error);
						audioPlaying = false;
					});
			}
		}
		lastButtonState = state;
	});
}

// -------------- End Raspberry Pi Stuff ----------------

// -------------- Mac Stuff ----------------

if (system === 'macOS') {
	playMP3('./audio/10min.mp3');
}

// -------------- End Mac Stuff ----------------



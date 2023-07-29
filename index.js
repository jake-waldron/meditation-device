import downloadTodaysMeditations from './download.js';
import gpio from 'array-gpio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import getAuth from './auth.js';

import { schedule } from 'node-cron';
import playMp3RaspPi from './raspPi.js';
import playMP3 from './audio.js';

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
console.log(system);

// -------------- Raspberry Pi Stuff ----------------

let audioPlaying = false;

if (system === 'raspPi') {
	// set up the button
	let button = gpio.setInput(37);
	button.setR('pu');

	let lastButtonState = true;

	button.watch(async (state) => {
		console.log(state);
		if (state !== lastButtonState) {
			if (state === false && audioPlaying === false) {
				audioPlaying = true;
				console.log('button pressed');
				playMp3RaspPi('./audio/10min.mp3')
					.then(() => {
						audioPlaying = false;
					})
					.catch((error) => {
						console.log(error);
						audioPlaying = false;
					});
			}
			// if (state === true) {
			// 	console.log('button released');
			// }
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

function removeMp3Files() {
	console.log('clearing folder');
	const directoryPath = path.join('./audio');
	const files = fs.readdirSync(directoryPath);
	const mp3Files = files.filter((file) => path.extname(file) === '.mp3');
	mp3Files.forEach((file) => {
		fs.unlinkSync(path.join(directoryPath, file));
	});
	console.log('mp3 files removed');
}

import downloadTodaysMeditations from './download.js';
import gpio from 'array-gpio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import getAuth from './auth.js';
import { exec } from 'child_process';

import { schedule } from 'node-cron';
import playMp3RaspPi from './raspPi.js';

dotenv.config();

// -------------- Raspberry Pi Stuff ----------------

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';
console.log(system);

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

// ---------------	On Startup	----------------

try {
	removeMp3Files();
	const bearerToken = await getAuth();
	downloadTodaysMeditations(bearerToken);
} catch (error) {
	console.log(error);
}

schedule('0 0 * * *', async () => {
	removeMp3Files();
	const bearerToken = await getAuth();
	downloadTodaysMeditations(bearerToken);
});

// ---------------	End On Startup	----------------

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

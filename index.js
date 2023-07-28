import downloadTodaysMeditations from './download.js';
import gpio from 'array-gpio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import getAuth from './auth.js';

import { schedule } from 'node-cron';

dotenv.config();

// -------------- Raspberry Pi Stuff ----------------

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';
console.log(system);

if (system === 'raspPi') {
	// set up the button
	let button = gpio.setInput(37);
	button.setR('pu');

	let lastButtonState = true;

	button.watch((state) => {
		console.log(state);
		if (state !== lastButtonState) {
			if (state === false) {
				console.log('button pressed');
				// playTodaysMeditation(system);
			}
			if (state === true) {
				console.log('button released');
			}
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

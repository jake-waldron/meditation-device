import downloadTodaysMeditations from './playTodays.js';
import gpio from 'array-gpio';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import getAuth from './auth.js';

dotenv.config();

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

const bearerToken = await getAuth();

function checkForMp3Files() {
	const directoryPath = path.join('./audio');
	const files = fs.readdirSync(directoryPath);
	const mp3Files = files.filter((file) => path.extname(file) === '.mp3');
	return mp3Files.length > 0;
}

if (!checkForMp3Files()) {
	console.log('no mp3 files');
} else if (checkForMp3Files()) {
	console.log('mp3 files found');
}

try {
	downloadTodaysMeditations(bearerToken);
} catch (error) {
	console.log(error);
}

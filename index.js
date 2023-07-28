import playTodaysMeditation from './playTodays.js';
import gpio from 'array-gpio';
import dotenv from 'dotenv';
import { exec } from 'child_process';

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

async function getAuth() {
	console.log('getting auth');
	let bearer;
	return new Promise((resolve, reject) => {
		const child = exec('python3 auth.py', (error, stdout, stderr) => {
			if (error) {
				reject(error);
			}
			bearer = stdout;
		});
		child.on('close', (code, signal) => {
			console.log('auth gotten');
			resolve(bearer.trim());
		});
	});
}

const bearerToken = await getAuth();
console.log(bearerToken);

try {
	playTodaysMeditation(system, bearerToken);
} catch (error) {
	console.log(error);
}

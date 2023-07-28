import playTodaysMeditation from './playTodays.js';
import ArrayGpio from 'array-gpio';

let button = ArrayGpio.setInput(37);
button.setR('pu');

let lastButtonState = 1;
// Pressing the switch sw button, the led will turn on
// Releasing the switch sw button, the led will turn off
button.watch((state) => {
	if (state !== lastButtonState) {
		// console.log('button state changed');
		if (state === 0) {
			console.log('button pressed');
			playTodaysMeditation(system);
		}
		if (state === 1) {
			console.log('button released');
		}
	}
	// if (state === 1 && lastButtonState === 0) {
	// 	console.log('button released');
	// }
	// if (state === 0 && lastButtonState === 1) {
	// 	console.log('button pressed');
	// 	// playTodaysMeditation(system);
	// }
	lastButtonState = state;
});

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';
console.log(system);

// try {
// 	playTodaysMeditation(system);
// } catch (error) {
// 	console.log(error);
// }

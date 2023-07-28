import playTodaysMeditation from './playTodays.js';
import ArrayGpio from 'array-gpio';

let button = ArrayGpio.setInput(37);
button.setR('pu');

let lastButtonState = true;
// Pressing the switch sw button, the led will turn on
// Releasing the switch sw button, the led will turn off
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

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';
console.log(system);

// try {
// 	playTodaysMeditation(system);
// } catch (error) {
// 	console.log(error);
// }

import playTodaysMeditation from './playTodays.js';
import ArrayGpio from 'array-gpio';

let sw = ArrayGpio.in(26);

// Pressing the switch sw button, the led will turn on
// Releasing the switch sw button, the led will turn off
sw.watch((state) => {
	console.log('state: ' + state);
});

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';
console.log(system);

// try {
// 	playTodaysMeditation(system);
// } catch (error) {
// 	console.log(error);
// }

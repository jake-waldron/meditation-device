import playTodaysMeditation from './playTodays.js';
import ArrayGpio from 'array-gpio';

let sw = ArrayGpio.setInput(26);

// Pressing the switch sw button, the led will turn on
// Releasing the switch sw button, the led will turn off
sw.watch((state) => {
	console.log('state: ' + state);
});

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';
console.log(system);

setInterval(() => {
	sw.read((state) => {
		console.log(state);
	});
}, 1000);

// try {
// 	playTodaysMeditation(system);
// } catch (error) {
// 	console.log(error);
// }

import runAutomation from './automation.js';
import playTodaysMeditation from './playTodays.js';

// const system = process.argv[2] || 'macOS';

const system = process.platform === 'darwin' ? 'macOS' : 'raspPi';
console.log(system);

try {
	playTodaysMeditation(system);
} catch (error) {
	console.log(error);
}

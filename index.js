import runAutomation from './automation.js';
import playTodaysMeditation from './playTodays.js';

const system = process.argv[2] || 'macOS';

try {
	playTodaysMeditation(system);
} catch (error) {
	console.log(error);
}

import runAutomation from './automation.js';
import playTodaysMeditation from './playTodays.js';

try {
	playTodaysMeditation();
} catch (error) {
	console.log(error);
}

import utils from 'util';
import { exec } from 'child_process';

export const promisifyExec = utils.promisify(exec);

// async function promisifyExec(command) {
// 	return new Promise((resolve, reject) => {
// 		const child = exec(command, (error, stdout, stderr) => {
// 			// if (error) {
// 			// 	reject(error);
// 			// } else {
// 			// 	resolve(stdout);
// 			// }
// 		});

// 		child.on('close', (code) => {
// 			if (code !== 0) {
// 				reject(new Error(`Command ${command} failed with exit code ${code}`));
// 			}
// 			resolve(code);
// 		});
// 	});
// }

import { exec } from 'child_process';

export default async function getAuth() {
	console.log('getting auth');
	let bearer;
	return new Promise((resolve, reject) => {
		const child = exec('python3 setup.py', (error, stdout, stderr) => {
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

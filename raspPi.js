import { exec } from 'child_process';
import { promisifyExec } from './utils.js';

// Function to check if Raspberry Pi is connected to Bluetooth headphones
async function checkBluetoothConnection() {
	try {
		await promisifyExec('pulseaudio --check');
	} catch (err) {
		console.error('Pulseaudio is not running!');
		await promisifyExec('pulseaudio --start');
	}

	return new Promise((resolve, reject) => {
		exec(`bluetoothctl connect ${process.env.DEVICE_ID}`, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout.includes('Connection successful'));
			}
		});
	});
}

// Function to play the MP3 file from the given URL
export default async function playMp3RaspPi(mp3FileName) {
	const isConnected = await checkBluetoothConnection();

	return new Promise(async (resolve, reject) => {
		if (!isConnected) {
			console.error('Not connected to the correct Bluetooth headphones!');

			reject(new Error('Not connected to the correct Bluetooth headphones!'));
		}

		// Delay so that the bluetooth connected voice shuts up before playing mp3
		await new Promise((resolve) => setTimeout(resolve, 5000));

		const child = exec(`mpg321 -g 50 ${mp3FileName}`, (error) => {
			if (error) {
				console.error('Failed to stream audio:', error);
				exec('bluetoothctl disconnect');
				reject(error);
			}
		});

		child.on('close', (code) => {
			if (code !== 0) {
				console.error('Audio playback failed with exit code:', code);
				exec('bluetoothctl disconnect');
				reject(new Error('Audio playback failed with exit code:', code));
			}

			console.log('Audio streamed successfully!');

			exec('bluetoothctl disconnect');
			resolve();
		});
	});
}

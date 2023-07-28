import { exec } from 'child_process';

// Function to check if Raspberry Pi is connected to Bluetooth headphones
async function checkBluetoothConnection(deviceName) {
	exec(`bluetoothctl connect ${process.env.DEVICE_ID}`);
	return new Promise((resolve, reject) => {
		exec('bluetoothctl devices', (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else {
				const connectedDevices = stdout.split('\n').filter((device) => device.includes(deviceName));
				resolve(connectedDevices.length > 0);
			}
		});
	});
}

// Function to play the MP3 file from the given URL
export default async function playMp3RaspPi(mp3FileName) {
	const bluetoothDeviceName = 'WH-1000XM4';
	const isConnected = await checkBluetoothConnection(bluetoothDeviceName);

	// Delay so that the bluetooth connected voice shuts up before playing mp3
	await new Promise((resolve) => setTimeout(resolve, 1000));

	return new Promise((resolve, reject) => {
		if (!isConnected) {
			console.error('Not connected to the correct Bluetooth headphones!');

			reject('Not connected to the correct Bluetooth headphones!');
		}

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
				reject(code);
			}

			console.log('Audio streamed successfully!');

			exec('bluetoothctl disconnect');
			resolve();
		});
	});
}

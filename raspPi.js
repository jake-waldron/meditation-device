// Make sure you have the bluealsa and bluez-alsa packages installed on your Raspberry Pi Zero:

// sudo apt-get update
// sudo apt-get install bluealsa bluez-alsa
import fs from 'fs';
import https from 'https';
import { exec } from 'child_process';

// Function to check if Raspberry Pi is connected to Bluetooth headphones
const checkBluetoothConnection = (deviceName) => {
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
};

// Function to play the MP3 file from the given URL
export default async function playMp3RaspPi(mp3URL) {
	// Generate a unique file name for the downloaded MP3 file
	const mp3FileName = `temp_${Date.now()}.mp3`;

	const file = fs.createWriteStream(mp3FileName);
	https
		.get(mp3URL, async (response) => {
			response.pipe(file);
			console.log('MP3 file downloaded successfully!');

			const bluetoothDeviceName = 'WH-1000XM4';
			const isConnected = await checkBluetoothConnection(bluetoothDeviceName);

			if (!isConnected) {
				console.error('Not connected to the correct Bluetooth headphones!');
				return;
			}

			// Stream the MP3 file to Bluetooth headphones
			// exec(`aplay --profile a2dp ${mp3FileName}`, (error) => {
			exec(`aplay  ${mp3FileName}`, (error) => {
				if (error) {
					console.error('Failed to stream audio:', error);
					return;
				}
				console.log('Audio streamed successfully!');

				// Delete the MP3 file after playing
				fs.unlink(mp3FileName, (error) => {
					if (error) {
						console.error('Failed to delete MP3 file:', error);
						return;
					}
					console.log('MP3 file deleted!');
				});
			});
		})
		.on('error', (error) => {
			console.error('Failed to download MP3 file:', error);
		});
}

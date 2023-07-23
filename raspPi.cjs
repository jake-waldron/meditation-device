// Make sure you have the bluealsa and bluez-alsa packages installed on your Raspberry Pi Zero:

// sudo apt-get update
// sudo apt-get install bluealsa bluez-alsa
const fs = require('fs');
const https = require('https');
const { exec } = require('child_process');

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
const playMP3FromURL = async (mp3URL) => {
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
			exec(`bluealsa-aplay --profile a2dp ${mp3FileName}`, (error) => {
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
};

// Usage example:
const mp3URL =
	'https://d3jyalop6jpmn2.cloudfront.net/private/encoded/pack-evdh-mind-s255-3min-g-en__1524523865976_vbr_1ch_high_quality_mp3.mp3?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9kM2p5YWxvcDZqcG1uMi5jbG91ZGZyb250Lm5ldC9wcml2YXRlL2VuY29kZWQvcGFjay1ldmRoLW1pbmQtczI1NS0zbWluLWctZW5fXzE1MjQ1MjM4NjU5NzZfdmJyXzFjaF9oaWdoX3F1YWxpdHlfbXAzLm1wMyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTY5MDEyMzE5N319fV19&Key-Pair-Id=APKAJU742EIY3FZWPVSA&Signature=fQFaiSFaizPzmZeKaZUutoz8TVAM-DVAeUdbNNVXWbhWtM87WYW-5dL8O3Bd6BSyyURtFGCbA-eiUaneZSqCf~Gb1632~To6HuZcgm6HUPN5V14PGllhffh8pAsO5u2SiEXw2FfNU6AgGFrP0rMz9HGJEt92Pdk~OeCXfBzIiJGYLPRcBZGaPPhI-XRejKMcr6wIvy85NoP4z9BeYYC9b1Uja0Kd3Z4gbCaulhsWodCqxCj9bGcU8Vudya3paA8xQHpbZmhWd~sku1pztadyK0f-n7OCl4JKiWUWLipbluP9pWbfjdBPESOCYZC-K1JINxadpvLK4TRKCZ1mMe4GxA__';
playMP3FromURL(mp3URL);

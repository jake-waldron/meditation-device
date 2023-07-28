import fs from 'fs';
import https from 'https';
import { exec } from 'child_process';

export default function downloadMp3(meditation) {
	// function to download file from provided url and save to a file in /audio folder

	// generate a unique file name for the downloaded MP3 file
	const mp3FileName = `./audio/${meditation.duration}min.mp3`;
	// console.log(`Created file name: ${mp3FileName}`);

	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(mp3FileName);
		https
			.get(meditation.url, (response) => {
				response.pipe(file);
				console.log('MP3 file download started!' + meditation.duration);

				file.on('finish', () => {
					console.log(`File download completed successfully! ${meditation.duration}min`);
					resolve(mp3FileName);
				});
			})
			.on('error', (error) => {
				console.error('Failed to download MP3 file:', error);
				reject(error);
			});
	});
}

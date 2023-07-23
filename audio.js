import fs from 'fs';
import https from 'https';
import { exec } from 'child_process';

// Function to play the MP3 file from the given URL
export default function playMP3FromURL(mp3URL) {
	// Generate a unique file name for the downloaded MP3 file
	const mp3FileName = `temp_${Date.now()}.mp3`;
	console.log(`Created file name: ${mp3FileName}`);

	const file = fs.createWriteStream(mp3FileName);
	https
		.get(mp3URL, (response) => {
			response.pipe(file);
			console.log('MP3 file downloaded successfully!');

			// Stream the MP3 file to the audio device
			exec(`afplay ${mp3FileName}`, (error) => {
				if (error) {
					console.error('Failed to play MP3 file:', error);
					return;
				}
				console.log('MP3 file played successfully!');

				// Delete the MP3 file after playing
				fs.unlink(mp3FileName, (error) => {
					if (error) {
						console.error('Failed to delete MP3 file:', error);
						return;
					}
					console.log('MP3 file deleted!');
					return new Promise((resolve, reject) => {
						resolve();
					});
				});
			});
		})
		.on('error', (error) => {
			console.error('Failed to download MP3 file:', error);
		});
}

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';
import {meditationDurations} from "./utils.js";

dotenv.config();

const everydayURL = 'https://api.prod.headspace.com/content/view-models/everyday-headspace-banner';

let BEARER_TOKEN;

function setHeaders(token) {
	return {
		authority: 'api.prod.headspace.com',
		accept: 'application/vnd.api+json',
		'user-agent':
			'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36',
		authorization: token,
		'hs-languagepreference': 'en-US',
		'sec-gpc': '1',
		origin: 'https://my.headspace.com',
		'sec-fetch-site': 'same-site',
		'sec-fetch-mode': 'cors',
		referer: 'https://my.headspace.com/',
		'accept-language': 'en-US,en;q=0.9',
	};
}

function getUserId() {
	if (BEARER_TOKEN) {
		try {
			const decodedToken = jwt.decode(BEARER_TOKEN.split(' ')[1], { verify_signature: false });
			return decodedToken['https://api.prod.headspace.com/hsId'] || '';
		} catch (error) {
			return '';
		}
	}
	return '';
}

export default async function downloadTodaysMeditations(token) {
	return new Promise(async (resolve, reject) => {
		BEARER_TOKEN = token;
		const USER_ID = getUserId();
		if (!USER_ID) {
			reject(new Error('No valid USER_ID found. Make sure the BEARER_TOKEN is properly set.'));
		}

		const params = {
			date: new Date().toISOString().split('T')[0],
			userId: USER_ID,
		};

		const url = new URL(everydayURL);
		url.search = new URLSearchParams(params).toString();

		const response = await fetch(url, { headers: setHeaders(BEARER_TOKEN) });

		if (!response.ok) {
			reject(new Error(`HTTP error: status-code = ${response.status}`));
		}

		const data = await response.json();
		const sessions = data.included;

		const meditations = sessions.filter(
			(session) => session.type === 'mediaItems' && session.attributes.mimeType === 'audio/mpeg'
		);

		const downloadLinks = await Promise.all(
			meditations.map(async (meditation) => {
				const response = await fetch(
					`https://api.prod.headspace.com/content/media-items/${meditation.id}/make-signed-url`,
					{ headers: setHeaders(BEARER_TOKEN) }
				);
				const { url } = await response.json();
				return {
					url,
					duration: meditation.attributes?.durationInMs,
					name: meditation.attributes?.filename,
				};
			})
		)

		const sortedByLength = downloadLinks.sort((a, b) => a.duration - b.duration);

		// Download meditations in order of length, save them to the audio folder
		await Promise.all(sortedByLength.map((link, index) => downloadMp3(link, index)));

		console.log('All meditations downloaded!');
		resolve();

	});
}

// Download the MP3 file and save it to the audio folder
function downloadMp3(meditation, index) {
	const mp3FileName = `./audio/${meditationDurations[index]}.mp3`;

	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(mp3FileName);
		https
			.get(meditation.url, (response) => {
				response.pipe(file);
				console.log(`MP3 file download started! ${mp3FileName}`);

				file.on('finish', () => {
					console.log(`File download completed successfully! ${mp3FileName}`);
					resolve(mp3FileName);
				});
			})
			.on('error', (error) => {
				console.error('Failed to download MP3 file:', error);
				reject(error);
			});
	});
}

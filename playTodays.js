import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import downloadMp3 from './download.js';

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

function getDuration(time) {
	const orig_duration = time / 60000;

	let minutes = Math.floor(time / 60000);
	let unit_place = minutes % 10;

	if (0 < unit_place && unit_place < 5) {
		minutes -= unit_place;
	} else if (unit_place > 5) {
		minutes -= unit_place - 5;
	}

	if (minutes === 0) {
		if (orig_duration >= 2 && orig_duration < 3) {
			minutes = 2;
		} else if (orig_duration >= 3 && orig_duration < 4) {
			minutes = 3;
		} else if (orig_duration >= 4 && orig_duration <= 5) {
			minutes = 5;
		} else {
			minutes = 1;
		}
	}

	return minutes;
}

export default async function downloadTodaysMeditations(token) {
	BEARER_TOKEN = token;
	const USER_ID = getUserId();
	if (!USER_ID) {
		console.log('No valid USER_ID found. Make sure the BEARER_TOKEN is properly set.');
		return;
	}

	const params = {
		date: new Date().toISOString().split('T')[0],
		userId: USER_ID,
	};

	const url = new URL(everydayURL);
	url.search = new URLSearchParams(params).toString();

	const response = await fetch(url, { headers: setHeaders(BEARER_TOKEN) });

	if (!response.ok) {
		throw new Error(`HTTP error: status-code = ${response.status}`);
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
			return { url, duration: getDuration(meditation.attributes?.durationInMs), name: meditation.attributes?.filename };
		})
	);

	await Promise.all(downloadLinks.map((link) => downloadMp3(link)));

	console.log('All meditations downloaded!');

	// const signId = meditation.id;
	// const signUrl = `https://api.prod.headspace.com/content/media-items/${signId}/make-signed-url`;
	// const mp3Url = await getMp3Url(signUrl);
	// if (system === 'macOS') {
	// 	// playMP3FromURL(mp3Url);
	// } else if (system === 'raspPi') {
	// 	playMp3RaspPi(mp3Url);
	// }
}

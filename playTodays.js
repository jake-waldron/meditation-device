import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import playMP3FromURL from './audio.js';

dotenv.config({ path: './.env.local' });

const everydayURL = 'https://api.prod.headspace.com/content/view-models/everyday-headspace-banner';
const DESIRED_LANGUAGE = 'en-US';
const BEARER_TOKEN = process.env.BEARER_TOKEN;
const LENGTH = `${process.env.LENGTH}min`;

console.log(BEARER_TOKEN);
const headers = {
	authority: 'api.prod.headspace.com',
	accept: 'application/vnd.api+json',
	'user-agent':
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36',
	authorization: BEARER_TOKEN,
	'hs-languagepreference': DESIRED_LANGUAGE,
	'sec-gpc': '1',
	origin: 'https://my.headspace.com',
	'sec-fetch-site': 'same-site',
	'sec-fetch-mode': 'cors',
	referer: 'https://my.headspace.com/',
	'accept-language': 'en-US,en;q=0.9',
};

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

export default async function playTodaysMeditation() {
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

	const response = await fetch(url, { headers });

	if (!response.ok) {
		throw new Error(`HTTP error: status-code = ${response.status}`);
	}

	const data = await response.json();
	const sessions = data.included;

	const meditation = sessions.find(
		(session) => session.type === 'mediaItems' && session.attributes?.filename.includes(LENGTH)
	);
	const signId = meditation.id;
	const signUrl = `https://api.prod.headspace.com/content/media-items/${signId}/make-signed-url`;
	const mp3Url = await getMp3Url(signUrl);
	playMP3FromURL(mp3Url);
}

async function getMp3Url(signedUrl) {
	const response = await fetch(signedUrl, { headers });
	const { url } = await response.json();
	return url;
}

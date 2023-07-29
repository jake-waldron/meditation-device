import { promisifyExec } from './utils';

export default async function playMP3(mp3FileName) {
	try {
		await promisifyExec(`mpg321 -g 50 ${mp3FileName}`);
		console.log('Audio streamed successfully!');
	} catch (err) {
		console.error('Failed to stream audio:', err);
		return;
	}
}

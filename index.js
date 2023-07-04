import puppeteer from 'puppeteer';
import 'dotenv/config';

function getTime(text) {
	const raw = text.split(':');
	const minutes = parseInt(raw[0]);
	const seconds = parseInt(raw[1]);
	return minutes * 60000 + seconds * 1000;
}

async function main() {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: process.env.CHROME_DIR,
		protocolTimeout: 60000 * 10, // set 10 min timeout
	});
	const page = await browser.newPage();
	page.setDefaultTimeout(0);

	// Go to the headspace website
	await page.goto('https://my.headspace.com/modes/meditate');

	// if not logged in already, log in
	if (page.$('h3 ::-p-text(Log in)')) {
		await page.type('input[aria-labelledby="email-label"]', process.env.USERNAME);
		await page.type('input[aria-labelledby="password-label"]', process.env.PASSWORD);
		console.log('clicking button');
		const logInButton = await page.$('button[data-testid="submit-login-btn"]');
		logInButton.click();
	}

	// Find the link to today's meditation based on the css class and click it
	const anchor = await page.waitForSelector('.css-s0vuju');
	await anchor.click();

	// Find the "Play" button and click it
	const playButton = await page.waitForSelector('button[aria-label="Play"]');
	const timeElement = await page.waitForSelector('.css-gg4vpm > p:last-child');
	const timeText = await (await timeElement.getProperty('textContent')).jsonValue();
	const timeout = getTime(timeText);

	await playButton.click();

	// Wait until the audio finishes playing (button label turns to "Pause" while audio is playing)
	await page.waitForSelector('button[aria-label="Play"]', { timeout: timeout });
	console.log('Audio playback finished!');

	// Close the browser
	await browser.close();
}

main();

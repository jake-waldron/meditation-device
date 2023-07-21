import puppeteer from 'puppeteer';
import 'dotenv/config';

function delay(seconds) {
	return new Promise((r) => setTimeout(r, seconds * 1000));
}

async function runAutomation() {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: process.env.CHROME_DIR,
		protocolTimeout: 60000 * 10, // set 10 min timeout
	});
	const page = await browser.newPage();

	// Go to the headspace website
	await page.goto('https://my.headspace.com/modes/meditate');

	// If not logged in already, log in
	if (page.$('h3 ::-p-text(Log in)')) {
		await page.type('input[aria-labelledby="email-label"]', process.env.USERNAME);
		await page.type('input[aria-labelledby="password-label"]', process.env.PASSWORD);
		const logInButton = await page.$('button[data-testid="submit-login-btn"]');
		logInButton.click();
	}

	await page.waitForNavigation({ waitUntil: 'networkidle2' });

	// Finds the link to today's meditation based on the css class and clicks it
	await page.evaluate(() => {
		// document.querySelector('.css-s0vuju').click();
		document.querySelector('a[href^="/player/"]').click();
	});

	// Open settings and set the length to 10 minutes
	const settingsButton = await page.waitForSelector('button[aria-label="Open Player Settings"]');
	await settingsButton.click();

	const label = await page.waitForFunction(() => {
		const labels = [...document.querySelectorAll('label')];
		return labels.find((label) => label.textContent === '10');
	});

	await label.click();

	const closeButton = await page.$('button[aria-label="Close Player Settings"]');
	await closeButton.click();

	// Waits for the time to update
	await page.waitForFunction(() => {
		const timeElement = document.querySelector(
			'div[data-testid="audio-player-scrubber-container"] + div > p:last-child'
		);
		console.log(timeElement);
		return timeElement && timeElement.textContent !== '0:00';
	});

	// Gets the time elements and their text contents
	const totalTime = await page.$eval(
		'div[data-testid="audio-player-scrubber-container"] + div > p:last-child',
		(el) => el.textContent
	);

	let currentTime = await page.$eval(
		'div[data-testid="audio-player-scrubber-container"] + div > p:first-child',
		(el) => el.textContent
	);

	console.log({ currentTime, totalTime });

	await delay(0.5);

	// // Finds the "Play" button and clicks it
	await page.evaluate(() => {
		document.querySelector('button[aria-label="Play"').click();
	});

	// if current play time doesn't match the total time, check every second
	while (currentTime !== totalTime) {
		await delay(1);
		console.log('checking time');
		currentTime = await page.$eval(
			'div[data-testid="audio-player-scrubber-container"] + div > p:first-child',
			(el) => el.textContent
		);
	}

	await browser.close();
}

runAutomation();

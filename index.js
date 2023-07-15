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

	// Finds the link to today's meditation based on the css class and clicks it
	const anchor = await page.waitForSelector('.css-s0vuju');
	await anchor.click();

	// Open settings and set the length to length set in .env
	const settingsButton = await page.waitForSelector('button[aria-label="Open Player Settings"]');
	await settingsButton.click();

	const label = await page.waitForFunction(() => {
		const labels = [...document.querySelectorAll('label')];
		return labels.find((label) => label.textContent === '10');
	});

	await label.click();

	// const lengthButton = await page.waitForSelector('label[for="4389"]');
	// await lengthButton.click();

	const closeButton = await page.waitForSelector('button[aria-label="Close Player Settings"]');
	await closeButton.click();

	// // Finds the "Play" button and clicks it
	// const playButton = await page.waitForSelector('button[aria-label="Play"]');
	// await playButton.click();

	// Waits for the time to update
	await page.waitForFunction(() => {
		const timeElement = document.querySelector('.css-gg4vpm > p:last-child');
		return timeElement && timeElement.textContent !== '0:00';
	});

	// Gets the time elements and their text contents
	const totalTimeElement = await page.waitForSelector('.css-gg4vpm > p:last-child');
	const totalTime = await (await totalTimeElement.getProperty('textContent')).jsonValue();

	const currentTimeElement = await page.waitForSelector('.css-gg4vpm > p:first-child');
	let currentTime = await (await currentTimeElement.getProperty('textContent')).jsonValue();

	console.log({ currentTime, totalTime });

	// Finds the "Play" button and clicks it
	const playButton = await page.waitForSelector('button[aria-label="Play"]');
	await playButton.click();

	// if current play time doesn't match the total time, check every second
	while (currentTime !== totalTime) {
		await delay(1);
		console.log('checking time');
		currentTime = await (await currentTimeElement.getProperty('textContent')).jsonValue();
	}

	await browser.close();
}

runAutomation();

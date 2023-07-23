import 'dotenv/config';
import https from 'https';
const LOGIN_URL = 'https://www.headspace.com/login';
const AUTH_URL = 'https://auth.headspace.com/co/authenticate';
const BEARER_TOKEN_URL = 'https://auth.headspace.com/authorize';

const headers = {
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:88.0) Gecko/20100101 Firefox/88.0',
	Accept: '*/*',
	'Accept-Language': 'en-US,en;q=0.5',
	'Content-Type': 'application/json',
	Origin: 'https://www.headspace.com',
	// Connection: 'keep-alive',
	TE: 'Trailers',
};

const fetchOptions = {
	headers,
	// agent: new https.Agent({ rejectUnauthorized: false }),
};

async function get_client_id() {
	const response = await fetch(LOGIN_URL, fetchOptions);
	const body = await response.text();
	// console.log(body);
	const client_id = body.match(/"clientId":"([^"]*)"/);
	console.log(client_id[1]);
	return client_id[1];
}

async function get_bearer_token(client_id, login_ticket) {
	const params = new URLSearchParams({
		client_id: client_id,
		response_type: 'token',
		response_mode: 'web_message',
		redirect_uri: 'https://www.headspace.com/auth',
		scope: 'openid email',
		audience: 'https://api.prod.headspace.com',
		realm: 'User-Password-Headspace',
		login_ticket,
		prompt: 'none',
	});

	const url = new URL(BEARER_TOKEN_URL);
	url.search = new URLSearchParams(params).toString();

	const response = await fetch(url, { headers });

	// const response = await fetch(`${BEARER_TOKEN_URL}?${params}`, fetchOptions);
	const body = await response.text();
	console.log(body);
	const bearer_token = body.match(/"access_token":"([^"]*)"/);
	console.log(bearer_token);
	return bearer_token[1];
}

async function authenticate(email, password) {
	const client_id = await get_client_id();
	const data = {
		client_id,
		username: email,
		password,
		realm: 'User-Password-Headspace',
		credential_type: 'http://auth0.com/oauth/grant-type/password-realm',
	};
	const authOptions = {
		method: 'POST',
		...fetchOptions,
		body: JSON.stringify(data),
	};
	const response = await fetch(AUTH_URL, authOptions);
	const resp_json = await response.json();
	if (!resp_json.hasOwnProperty('login_ticket')) {
		if (resp_json.hasOwnProperty('error')) {
			console.log(resp_json['error']);
			if (resp_json.hasOwnProperty('error_description')) {
				console.log(resp_json['error_description']);
			}
		} else {
			console.log(resp_json);
		}
		return false;
	}
	const login_ticket = resp_json['login_ticket'];
	console.log(login_ticket);
	const bearer_token = await get_bearer_token(data['client_id'], login_ticket);
	return 'bearer ' + bearer_token;
}

const email = process.env.USERNAME;
const password = process.env.PASSWORD;

authenticate(email, password)
	.then((bearer_token) => {
		if (bearer_token) {
			console.log(bearer_token);
		} else {
			console.log('Authentication failed.');
		}
	})
	.catch((error) => {
		console.error('An error occurred:', error);
	});

let btkn;

const api = 'https://api.mail.tm';
let domain = '';

const ls = localStorage;

//DOM integration
const tempadrs = document.getElementById('tempadrs');
const inbox = document.getElementById('inbox');

//auth account and get messages
function auth(address, password){
	return fetch(`${api}/token`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			address: address,
			password: password,
		})
	}).then(res => res.json())
	  .then(data => {
		btkn = data.token;
		return data.token; // Optional, if needed elsewhere
	});
}

function createAccount(){
	fetch(`${api}/domains`,{
		method: 'GET',
		headers: {'Content-Type': 'application/json'},
	}).then(res => res.json()).then(data => {
		domain = data['hydra:member'][0].domain;
	}).then(() => {
		const address = `${Math.floor(Math.random() * 10000000).toString(24)}@${domain}`;
		const password = Math.random().toString().slice(2);
		fetch(`${api}/accounts`,{
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				address: address,
				password: password,
			})
		}).then(res => res.json()).then(data => {
			auth(address, password).then(() => {
				tempadrs.innerHTML = `Your temp. mail address is <span style="color: #9DC08B">${data.address}</span><span><br>Click on any message to read it. Reload page to create new account.</span>`;
				getMessages();
			});
		});
	});
} createAccount();

function getMessages(){
	inbox.innerHTML = 'LOADING...';
	fetch(`https://corsproxy.io/?${api}/messages/`,{
		method: 'GET',
		headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + btkn},
	}).then(res => res.json())
	.then(data => {
		inbox.innerHTML = '';
		const ms = data['hydra:member'];
		if(ms.length == 0){
			inbox.innerHTML = 'Inbox is empty.';
		}

		for(let m = 0; m < ms.length; m++){
			const msgpreview = document.createElement('div');
			msgpreview.classList.add('msg-preview');
			msgpreview.id = ms[m].id;
			inbox.appendChild(msgpreview);

			const lt = document.createElement('div');
			const rt = document.createElement('div');

			lt.classList.add('lt');
			rt.classList.add('rt');

			msgpreview.append(lt, rt);

			const subject = document.createElement('h3');
			const intro = document.createElement('p');
			const sender = document.createElement('p');
			const senderadd = document.createElement('p');
			const senttime = document.createElement('p');

			subject.innerHTML = ms[m].subject;
			intro.innerHTML = ms[m].intro;
			sender.innerHTML = ms[m].from.name;
			senderadd.innerHTML = ms[m].from.address;
			senttime.innerHTML = new Date(ms[m].createdAt).toLocaleString();

			lt.append(subject, intro);
			rt.append(sender, senderadd, senttime);

			msgpreview.addEventListener('click', getMessageById, false);

		}

	});
}

function getMessageById(){
	fetch(`https://corsproxy.io/?${api}/messages/${this.id}`,{
		method: 'GET',
		headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ' + btkn},
	}).then(res => res.json()).then(data => {
		inbox.innerHTML = data.html[0];
	});
}
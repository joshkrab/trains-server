require('dotenv').config();
const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const bodyParser = require('body-parser')
const { MongoClient } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URL);

const start = async (req, res) => { 
	try {
		await client.connect(); 
		console.log('Connected to DB');
		console.log(req.method);

		if (req.method === 'GET') {
			let urlRequest = url.parse(req.url, true);
		// console.log(urlRequest);
		if (urlRequest.query.test % 2 === 0) {
			res.writeHead(200);
      res.end("Even");
		} else {
			res.writeHead(200);
      res.end("Odd");
			};
		};

		if (req.method === 'POST') {
			let body = '';
			req.on('data', chunk => {
				body += chunk.toString();
			})

			req.on('end', async () => {
				// let params = parse(body);
				// console.log(params);
				// console.log(body);

				const bodyJson = JSON.parse(body);
				console.log(bodyJson);

				const trains = client.db().collection('trains');
				await trains.insertOne(bodyJson);
				res.writeHead(200);
				res.end('Record created!');
			})
		};

		// await client.db().createCollection('users'); 
		// const users = client.db().collection('users');
		// await users.insertOne({
		// 	name: 'Ihor',
		// 	age: 22,
		// });
		// const user = await users.findOne({ name: 'Ihor' });
		// console.log(user);

		// res.writeHead(200);
    // res.end("My server!");
	} catch (error) {
		console.log(error);
	}
};

const server = http.createServer(start);
server.listen(process.env.SERVER_PORT || 5000, process.env.SERVER_HOST || 'localhost', () => {
	console.log(`Server is running on http://${process.env.SERVER_HOST || 'localhost'}:${process.env.SERVER_PORT || 5000}`);
});
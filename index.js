require('dotenv').config();
const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const bodyParser = require('body-parser')
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URL);

const start = async (req, res) => { 
	try {
		await client.connect(); 
		const trains = client.db().collection('trains');
		console.log('Connected to DB');
		console.log(req.method);

		if (req.method === 'GET') {
		// 	let urlRequest = url.parse(req.url, true);
		// console.log(urlRequest);
		// if (urlRequest.query.test % 2 === 0) {
		// 	res.writeHead(200);
    //   res.end("Even");
		// } else {
		// 	res.writeHead(200);
    //   res.end("Odd");
		// 	};

			const result = await trains.find().toArray();
			// console.log(result);
			// console.log(JSON.stringify(result));

			res.setHeader('Content-Type', 'application/json');
			res.writeHead(200);
			res.end(JSON.stringify(result));
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
				//console.log(bodyJson);

				await trains.insertOne(bodyJson);
				res.writeHead(200);
				res.end('Record created!');
			});
		};

		if (req.method === 'PUT') {
			let body = '';
			req.on('data', chunk => {
				body += chunk.toString();
			})

			req.on('end', async () => {
				const bodyJson = JSON.parse(body);
				console.log(bodyJson);
				let urlRequest = url.parse(req.url, true);
				console.log(urlRequest.query.id);
				const conditions = {
					_id: new ObjectId(urlRequest.query.id)
				};

				await trains.updateOne(conditions, { $set: bodyJson });

				// let train = await trains.findOne({ _id: urlRequest.query.id });
				// console.log(train);

				const result = await trains.find().toArray();

				res.setHeader('Content-Type', 'application/json');
				res.writeHead(200);
				res.end(JSON.stringify(result));
			});
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
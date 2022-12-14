require('dotenv').config();
const http = require('http');
const url = require('url');
const { parse } = require('querystring');
const bodyParser = require('body-parser')
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGO_URL);
// ,"debug": "nodemon index.js"

const start = async (req, res) => { 
	const headers = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "OPTIONS, POST, GET, DELETE, PUT, PATCH",
		"Access-Control-Allow-Headers": "Content-Type, Authorization",
		"Access-Control-Max-Age": 2592000,
		"Content-Type": "application/json"
	};

	try {
		await client.connect(); 
		const trains = client.db().collection('trains');
		console.log('Connected to DB');
		console.log(req.method);

		if (req.method === 'OPTIONS') {
			res.writeHead(204, headers);
			res.end();
			return;
		};

		if (req.method === 'GET') {

			let urlRequest = url.parse(req.url, true);
			let sort = urlRequest.query.sort || {startDate: -1};
			let search = urlRequest.query.search ?
				{
					$or: [
						{ startCity: { '$regex': `${urlRequest.query.search}`, '$options': 'i' } },
						{ finishCity: { '$regex': `${urlRequest.query.search}`, '$options': 'i' } }
					]
				} :
				{};

			const result = await trains.find(search).sort(sort).toArray();

			res.writeHead(200, {
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept"
			});
			res.end(JSON.stringify(result));
		};

		if (req.method === 'DELETE') {
			let urlRequest = url.parse(req.url, true);
				console.log(urlRequest.query.id);
				const conditions = {
					_id: new ObjectId(urlRequest.query.id)
				};

			await trains.deleteOne(conditions);
	
			const result = await trains.find().toArray();

				res.writeHead(200, headers);
				res.end(JSON.stringify(result));
				return;
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

				await trains.insertOne(bodyJson);
				const result = await trains.find().toArray();

				res.writeHead(200, headers);
				res.end(JSON.stringify(result));
				return;
			});
		};

		if (req.method === 'PATCH') {
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
				const result = await trains.find().toArray();

				res.setHeader('Content-Type', 'application/json');
				res.writeHead(200, headers);
				res.end(JSON.stringify(result));
				return;
			});
		};

	} catch (error) {
		console.log('??????????????');
		console.log(error);
	}
};
const port = process.env.PORT || 8000;

const server = http.createServer(start);
server.listen(port, () => {
	console.log(`Server is running on http://${process.env.SERVER_HOST || 'localhost'}:${port}`);
});
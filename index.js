// create the express server here
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const client = require('./db/client');

const server = express();
const { PORT = 3000 } = process.env;
const { apiRouter } = require('./api/index');

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static('public'));
const morgan = require('morgan');
server.use(morgan('dev'));
server.use('/api', apiRouter);

server.use((req, res, next) => {
	console.log('<___Body Logger START___> ');
	console.log(req.body);
	console.log('<___Body Logger END___> ');

	next();
});

server.use((req, res, next) => {
	res.sendStatus(404);
});

server.use((error, req, res, next) => {
	console.log('Server Log', error);
	res.status(500).send(error);
});

server.listen(PORT, () => {
	client.connect();
	console.log(`Listening on port ${PORT}`);
});

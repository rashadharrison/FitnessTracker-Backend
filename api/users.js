const express = require('express');
const usersRouter = express.Router();
const { getUserByUsername, createUser } = require('../db/users');
const { getPublicRoutinesByUser } = require('../db/routines');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

usersRouter.get('/me', (req, res, next) => {
	const user = req.user;

	try {
		if (!user) {
			const error = new Error('User not found');
			return res.status(404).send(error.message);
		} else {
			res.send(user);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.get('/:username/routines', async (req, res, next) => {
	const { username } = req.params;

	try {
		const { id } = await getUserByUsername(username);

		const usersPublicRoutines = await getPublicRoutinesByUser({ username, id });

		if (usersPublicRoutines) {
			res.send(usersPublicRoutines);
		} else {
			res.send({ message: 'No public routines found' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.post('/register', async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			const error = new Error('Missing credentials');
			return res.status(400).send({ data: error.message });
		}

		const user = await getUserByUsername(username);

		if (user) {
			const error = new Error('User already exists');
			return res.status(400).send({ data: error.message });
		}

		if (password.length < 8) {
			const error = new Error('Password must be at least 8 characters');
			return res.status(400).send({ data: error.message });
		}
		const newUser = await createUser({ username, password });

		res.send({ user: newUser });
	} catch ({ name, message }) {
		next({ name, message });
	}
});

usersRouter.post('/login', async (req, res, next) => {
	try {
		const { username, password } = req.body;

		if (!username || !password) {
			const error = new Error('Missing credentials');
			return res.status(400).send({ data: error.message });
		}

		const user = await getUserByUsername(username);

		if (!user) {
			const error = new Error('Invalid credentials');
			return res.status(400).send({ data: error.message });
		} else {
			const match = await bcrypt.compare(password, user.password);
			if (match) {
				delete user.password;
				const token = jwt.sign(user, JWT_SECRET);
				res.send({
					user,
					token,
					message: `logged in as ${username} successfully`,
				});
			}
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = { usersRouter };

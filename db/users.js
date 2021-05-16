const client = require('./client');
const bcrypt = require('bcrypt');

const hashPassword = async str => {
	const hash = await bcrypt.hash(str, 10);
	return hash;
};

const createUser = async ({ username, password }) => {
	const hashPass = await hashPassword(password);
	try {
		const {
			rows: [user],
		} = await client.query(
			`

    INSERT INTO users(username, password)
    VALUES($1, $2) 
    RETURNING *;
    
    
    
    
    
    `,
			[username, hashPass]
		);
		delete user.password;

		return user;
	} catch (error) {
		throw error;
	}
};

const getUser = async ({ username, password }) => {
	try {
		const user = await getUserByUsername(username);
		const hashedPassword = user.password;

		if (await bcrypt.compare(password, hashedPassword)) {
			delete user.password;
			return user;
		}
	} catch (error) {
		throw error;
	}
};

const getUserById = async userId => {
	try {
		const {
			rows: [user],
		} = await client.query(
			`
  SELECT id, username
	FROM users
	WHERE id=$1
  `,
			[userId]
		);

		return user;
	} catch (error) {
		throw error;
	}
};

const getUserByUsername = async username => {
	try {
		const {
			rows: [user],
		} = await client.query(
			`
  SELECT *
	FROM users
	WHERE username=$1
  
  `,
			[username]
		);

		return user;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	createUser,
	getUser,
	getUserById,
	getUserByUsername,
};

const requireUser = (req, res, next) => {
	const user = req.user;
	if (!user) {
		const error = new Error('User not found');
		return res.status(403).send(error);
	} else {
		return next();
	}
};

module.exports = { requireUser };

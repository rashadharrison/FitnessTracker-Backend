const express = require('express');
const activitiesRouter = express.Router();

const {
	getAllActivities,
	createActivity,
	updateActivity,
} = require('../db/activities');

const { getPublicRoutinesByActivity } = require('../db/routines');
const { requireUser } = require('./utils');

activitiesRouter.get('/', async (req, res, next) => {
	try {
		const allActivities = await getAllActivities();
		if (allActivities) {
			res.send(allActivities);
		} else {
			res.send({ message: 'No activities found' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
	const { activityId } = req.params;
	const id = parseInt(activityId);

	try {
		const routinesByActivity = await getPublicRoutinesByActivity({ id });

		if (routinesByActivity.length > 0) {
			res.send(routinesByActivity);
		} else {
			res.send([]);
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

activitiesRouter.post('/', requireUser, async (req, res, next) => {
	try {
		const { name, description } = req.body;

		if (name && description) {
			const createdActivity = await createActivity({ name, description });
			res.send(createdActivity);
		} else {
			res.send({ message: 'Missing fields' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

activitiesRouter.patch('/:activityId', requireUser, async (req, res, next) => {
	const { name, description } = req.body;
	const { activityId } = req.params;

	try {
		if (activityId || name || description) {
			const updatedActivity = await updateActivity({
				id: activityId,
				name,
				description,
			});
			res.send(updatedActivity);
		} else {
			res.send({ message: 'Missing fields' });
		}
	} catch ({ name, message }) {
		next({ name, message });
	}
});

module.exports = { activitiesRouter };

const express = require('express');
const routineActivitiesRouter = express.Router();
const { requireUser } = require('./utils');
const {
	updateRoutineActivity,
	getRoutineById,
	destroyRoutineActivity,
	getRoutineActivityById,
} = require('../db');

routineActivitiesRouter.patch(
	'/:routineActivityId',
	requireUser,
	async (req, res, next) => {
		const { routineActivityId: id } = req.params;
		const { count, duration } = req.body;
		try {
			const routineActivity = await getRoutineActivityById(id);

			const routine = await getRoutineById(routineActivity.routineId);

			if (req.user.id === routine.creatorId) {
				const updatedActivity = await updateRoutineActivity({
					id,
					count,
					duration,
				});
				res.send(updatedActivity);
			} else {
				next({
					name: 'Cannot Update Routine Activity',
					message: 'Permission not granted',
				});
			}
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
);

routineActivitiesRouter.delete(
	'/:routineActivityId',
	requireUser,
	async (req, res, next) => {
		const { routineActivityId: id } = req.params;

		try {
			const routineActivity = await getRoutineActivityById(id);
			const routine = await getRoutineById(routineActivity.routineId);
			if (req.user.id === routine.creatorId) {
				const deletedActivity = await destroyRoutineActivity(id);
				res.send(deletedActivity);
			} else {
				next({
					name: 'Cannot Update',
					message: 'Permission not granted',
				});
			}
		} catch ({ name, message }) {
			next({ name, message });
		}
	}
);

module.exports = { routineActivitiesRouter };

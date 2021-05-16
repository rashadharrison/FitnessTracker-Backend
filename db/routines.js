const client = require('./client');

const getRoutinesWithActivities = (routines, activities) => {
	routines.forEach(routine => {
		routine.activities = [];
		activities.map(routineActivity => {
			if (routineActivity.routineId === routine.id) {
				routine.activities.push(routineActivity);
			}
		});
	});

	return routines;
};

const createRoutine = async ({ creatorId, isPublic, name, goal }) => {
	// eslint-disable-next-line no-empty
	try {
		const {
			rows: [routin],
		} = await client.query(
			`
		
INSERT
INTO routines("creatorId", "isPublic", name, goal)
VALUES ($1, $2, $3, $4)
RETURNING *;
		
		
		`,
			[creatorId, isPublic, name, goal]
		);
		return routin;
	} catch (error) {
		throw error;
	}
};

const getRoutinesWithoutActivities = async () => {
	try {
		const { rows: routines } = await client.query(`
	SELECT *
	FROM routines
	
	
		`);

		return routines;
	} catch (error) {
		throw error;
	}
};

const getRoutineById = async id => {
	try {
		const {
			rows: [routine],
		} = await client.query(
			`
    
    SELECT *
		FROM routines
		WHERE id=$1;
    
    
    
    
    
    `,
			[id]
		);
		return routine;
	} catch (error) {
		throw error;
	}
};

/**     ✕ selects and returns an array of all routines, includes their activities (2 ms)
        ✕ includes username, from users join, aliased as creatorName
        ✕ includes duration and count on activities, from routine_activities join (1 ms) */

const getAllRoutines = async () => {
	try {
		const { rows: routines } = await client.query(
			`SELECT *, users.username
			AS "creatorName"
			FROM (routines
      JOIN users
			ON routines."creatorId" = users.id)`
		);

		const { rows: routine_activities } = await client.query(
			`SELECT *
			FROM routine_activities
      JOIN activities
			ON routine_activities."activityId" = activities.id`
		);

		return getRoutinesWithActivities(routines, routine_activities);
	} catch (error) {
		throw error;
	}
};

const getAllPublicRoutines = async () => {
	try {
		const { rows: routines } = await client.query(
			`SELECT *,users.username
			AS "creatorName"
			FROM routines
			JOIN users ON routines."creatorId" = users.id
      WHERE "isPublic" = true`
		);

		const { rows: routine_activities } = await client.query(
			`SELECT *
			FROM routine_activities
      JOIN activities ON
			routine_activities."activityId" = activities.id`
		);

		return getRoutinesWithActivities(routines, routine_activities);
	} catch (error) {
		throw error;
	}
};

async function getAllRoutinesByUser({ id }) {
	try {
		const { rows: routines } = await client.query(
			`SELECT *, users.username
			AS "creatorName"
			FROM routines
      JOIN users ON routines."creatorId" =$1`,
			[id]
		);
		const routineIds = routines.map(routin => routin.id).join(',');

		const { rows: routine_activities } = await client.query(`
			SELECT *
			FROM routine_activities
      JOIN activities ON routine_activities."activityId" = activities.id
			WHERE "routineId" IN (${routineIds});`);

		return getRoutinesWithActivities(routines, routine_activities);
	} catch (error) {
		throw error;
	}
}

async function getPublicRoutinesByUser(user) {
	try {
		const id = user.id;

		const { rows: routines } = await client.query(
			`
		SELECT routines.*, users.username
		AS "creatorName"
		FROM routines
    JOIN users
		ON routines."creatorId" =users.id
		WHERE "creatorId"=$1 AND "isPublic" = true;
	`,
			[id]
		);
		const routineIds = routines.map(routine => routine.id).join(',');

		const { rows: routine_activities } = await client.query(`
		SELECT *
		FROM routine_activities
    JOIN activities
		ON routine_activities."activityId" = activities.id
		WHERE routine_activities."routineId" IN (${routineIds});`);

		return getRoutinesWithActivities(routines, routine_activities);
	} catch (error) {
		throw error;
	}
}

const getPublicRoutinesByActivity = async ({ id }) => {
	try {
		const { rows: routineIds } = await client.query(
			`
		SELECT "routineId"
		FROM routine_activities
		WHERE "activityId" = $1;
		`,
			[id]
		); //get ids of all routines with query

		const routineIdStr = routineIds
			.map((_, index) => `$${index + 1}`)
			.join(', ');

		const { rows: routines } = await client.query(
			`
		 SELECT routines.*, users.username AS "creatorName"
		 FROM routines
		 JOIN users ON users.id = routines."creatorId"
		 WHERE "isPublic"= true AND routines.id IN (${routineIdStr});
	
		`,
			routineIds.map(({ routineId }) => routineId)
		);

		const { rows: routine_activities } = await client.query(
			`SELECT * FROM routine_activities 
            JOIN activities ON routine_activities."activityId" = activities.id
						WHERE "routineId" IN (${routineIdStr});`,
			routineIds.map(({ routineId }) => routineId)
		);

		return getRoutinesWithActivities(routines, routine_activities);
	} catch (error) {
		throw error;
	}
};

const updateRoutine = async ({ id, ...fields }) => {
	const setString = Object.keys(fields)
		.map((key, index) => {
			if (key === 'isPublic') {
				key = '"isPublic"';
			}
			return `${key}=$${index + 1}`;
		})
		.join(', ');

	const setValues = Object.values(fields);
	setValues.push(id);

	if (setString.length === 0) {
		return;
	}

	try {
		const {
			rows: [routin],
		} = await client.query(
			`
            UPDATE routines
            SET ${setString}
            WHERE id = $${setValues.length}
            RETURNING *;
        `,
			setValues
		);

		return routin;
	} catch (error) {
		throw error;
	}
};

const destroyRoutine = async routineId => {
	try {
		const {
			rows: [deletedRoutine],
		} = await client.query(
			`
		DELETE
		FROM routines
		WHERE id=$1
		RETURNING *`,
			[routineId]
		);

		await client.query(
			`DELETE 
			FROM routine_activities
			WHERE "routineId"=$1`,
			[routineId]
		);

		return deletedRoutine;
	} catch (err) {
		throw err;
	}
};

module.exports = {
	createRoutine,
	getRoutinesWithoutActivities,
	getAllRoutines,
	getRoutineById,
	getAllPublicRoutines,
	getPublicRoutinesByUser,
	getAllRoutinesByUser,
	getPublicRoutinesByActivity,
	updateRoutine,
	destroyRoutine,
};

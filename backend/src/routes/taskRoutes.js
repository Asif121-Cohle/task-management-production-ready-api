import { Router } from 'express';

import {
	assignTaskHandler,
	changeTaskStatusHandler,
	createTaskHandler,
	deleteTaskHandler,
	getTaskHandler,
	listTasksHandler,
	updateTaskHandler
} from '../controllers/taskController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
	assignTaskSchema,
	changeTaskStatusSchema,
	createTaskSchema,
	listTasksSchema,
	taskIdParamsSchema,
	updateTaskSchema
} from '../validators/taskValidators.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(createTaskSchema), createTaskHandler);
router.get('/', validateRequest(listTasksSchema), listTasksHandler);
router.get('/:id', validateRequest(taskIdParamsSchema), getTaskHandler);
router.put('/:id', validateRequest(updateTaskSchema), updateTaskHandler);
router.delete('/:id', validateRequest(taskIdParamsSchema), deleteTaskHandler);
router.patch('/:id/status', validateRequest(changeTaskStatusSchema), changeTaskStatusHandler);
router.patch('/:id/assign', validateRequest(assignTaskSchema), assignTaskHandler);

export default router;

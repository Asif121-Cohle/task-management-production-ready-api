import { Router } from 'express';

import {
	addProjectMemberHandler,
	createProjectHandler,
	deleteProjectHandler,
	getProjectHandler,
	listProjectsHandler,
	updateProjectHandler
} from '../controllers/projectController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import {
	addProjectMemberSchema,
	createProjectSchema,
	listProjectsQuerySchema,
	projectIdParamsSchema,
	updateProjectSchema
} from '../validators/projectValidators.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest(createProjectSchema), createProjectHandler);
router.get('/', validateRequest(listProjectsQuerySchema), listProjectsHandler);
router.get('/:id', validateRequest(projectIdParamsSchema), getProjectHandler);
router.put('/:id', validateRequest(updateProjectSchema), updateProjectHandler);
router.delete('/:id', validateRequest(projectIdParamsSchema), deleteProjectHandler);
router.post('/:id/members', validateRequest(addProjectMemberSchema), addProjectMemberHandler);

export default router;

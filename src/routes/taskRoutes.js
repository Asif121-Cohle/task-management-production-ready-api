import { Router } from 'express';

const router = Router();

router.all('*', (_req, res) => {
	res.status(501).json({
		success: false,
		message: 'Task endpoints will be implemented in Phase 6',
		errorCode: 'NOT_IMPLEMENTED'
	});
});

export default router;

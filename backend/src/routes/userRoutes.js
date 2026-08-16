import { Router } from 'express';

const router = Router();

router.all('*', (_req, res) => {
	res.status(501).json({
		success: false,
		message: 'User endpoints will be implemented in a later phase',
		errorCode: 'NOT_IMPLEMENTED'
	});
});

export default router;

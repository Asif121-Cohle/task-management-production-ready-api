export const notFoundMiddleware = (_req, res) => {
	res.status(404).json({
		success: false,
		message: 'Route not found',
		errorCode: 'ROUTE_NOT_FOUND'
	});
};

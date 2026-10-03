import { ZodError } from 'zod';

import env from '../config/environment.js';

const mapError = (error) => {
	if (error.statusCode) {
		return {
			statusCode: error.statusCode,
			message: error.message,
			errorCode: error.errorCode || 'API_ERROR',
			details: error.details
		};
	}

	if (error instanceof ZodError) {
		return {
			statusCode: 422,
			message: 'Validation failed',
			errorCode: 'VALIDATION_ERROR',
			details: error.issues
		};
	}

	if (error?.name === 'ValidationError') {
		return {
			statusCode: 422,
			message: 'Validation failed',
			errorCode: 'MONGOOSE_VALIDATION_ERROR'
		};
	}

	if (error?.name === 'CastError') {
		return {
			statusCode: 400,
			message: 'Invalid resource identifier',
			errorCode: 'INVALID_OBJECT_ID'
		};
	}

	if (error?.code === 11000) {
		return {
			statusCode: 409,
			message: 'Duplicate resource value',
			errorCode: 'DUPLICATE_KEY_ERROR'
		};
	}

	if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
		return {
			statusCode: 401,
			message: 'Invalid or expired authentication token',
			errorCode: 'INVALID_TOKEN'
		};
	}

	return {
		statusCode: 500,
		message: 'Internal server error',
		errorCode: 'INTERNAL_SERVER_ERROR'
	};
};

export const errorMiddleware = (error, _req, res, _next) => {
	const mapped = mapError(error);
	console.error(`[${mapped.errorCode}] ${error.message}`);

	const payload = {
		success: false,
		message: mapped.message,
		errorCode: mapped.errorCode
	};

	if (mapped.details) {
		payload.details = mapped.details;
	}

	if (env.NODE_ENV !== 'production') {
		payload.stack = error.stack;
	}

	res.status(mapped.statusCode).json(payload);
};

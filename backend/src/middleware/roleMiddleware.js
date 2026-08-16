import { ApiError } from '../utils/ApiError.js';

export const requireRole = (...roles) => (req, _res, next) => {
	if (!req.user) {
		next(new ApiError(401, 'Authentication is required', 'AUTH_REQUIRED'));
		return;
	}

	if (!roles.includes(req.user.role)) {
		next(new ApiError(403, 'You are not authorized for this action', 'FORBIDDEN'));
		return;
	}

	next();
};

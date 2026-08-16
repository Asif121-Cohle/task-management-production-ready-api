import jwt from 'jsonwebtoken';

import env from '../config/environment.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		throw new ApiError(401, 'Missing or invalid authorization header', 'AUTH_REQUIRED');
	}

	const token = authHeader.split(' ')[1];
	const payload = jwt.verify(token, env.JWT_SECRET);

	const user = await User.findById(payload.sub).select('name email role createdAt updatedAt');
	if (!user) {
		throw new ApiError(401, 'Authentication token user no longer exists', 'INVALID_TOKEN_USER');
	}

	req.user = {
		id: user._id.toString(),
		name: user.name,
		email: user.email,
		role: user.role
	};

	next();
});

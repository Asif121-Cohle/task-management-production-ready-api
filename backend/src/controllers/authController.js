import { getCurrentUser, loginUser, registerUser } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
	const result = await registerUser(req.body);

	res.status(201).json({
		success: true,
		message: 'User registered successfully',
		data: result
	});
});

export const login = asyncHandler(async (req, res) => {
	const result = await loginUser(req.body);

	res.status(200).json({
		success: true,
		message: 'Login successful',
		data: result
	});
});

export const me = asyncHandler(async (req, res) => {
	const user = await getCurrentUser(req.user.id);

	res.status(200).json({
		success: true,
		message: 'Current user profile retrieved successfully',
		data: user
	});
});

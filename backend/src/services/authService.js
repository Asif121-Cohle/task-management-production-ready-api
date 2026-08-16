import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';

const toSafeUser = (user) => ({
	id: user._id.toString(),
	name: user.name,
	email: user.email,
	role: user.role,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt
});

export const registerUser = async ({ name, email, password }) => {
	const normalizedEmail = email.toLowerCase();
	const existingUser = await User.findOne({ email: normalizedEmail });

	if (existingUser) {
		throw new ApiError(409, 'Email is already registered', 'EMAIL_ALREADY_EXISTS');
	}

	const user = await User.create({
		name,
		email: normalizedEmail,
		password
	});

	const token = generateToken(user);
	return {
		token,
		user: toSafeUser(user)
	};
};

export const loginUser = async ({ email, password }) => {
	const normalizedEmail = email.toLowerCase();
	const user = await User.findOne({ email: normalizedEmail }).select('+password');

	if (!user) {
		throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
	}

	const isMatch = await user.comparePassword(password);
	if (!isMatch) {
		throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
	}

	const token = generateToken(user);
	return {
		token,
		user: toSafeUser(user)
	};
};

export const getCurrentUser = async (userId) => {
	const user = await User.findById(userId).select('name email role createdAt updatedAt');

	if (!user) {
		throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
	}

	return toSafeUser(user);
};

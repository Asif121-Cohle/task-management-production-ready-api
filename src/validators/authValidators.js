import { z } from 'zod';

const strongPassword = z
	.string()
	.min(8, 'Password must be at least 8 characters long')
	.max(128, 'Password is too long');

export const registerSchema = z.object({
	body: z.object({
		name: z.string().trim().min(2).max(100),
		email: z.string().trim().email(),
		password: strongPassword
	}),
	params: z.object({}),
	query: z.object({})
});

export const loginSchema = z.object({
	body: z.object({
		email: z.string().trim().email(),
		password: z.string().min(1)
	}),
	params: z.object({}),
	query: z.object({})
});

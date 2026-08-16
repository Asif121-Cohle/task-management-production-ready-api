import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');

export const createProjectSchema = z.object({
	body: z.object({
		name: z.string().trim().min(2).max(120),
		description: z.string().trim().max(1000).optional().default('')
	}),
	params: z.object({}),
	query: z.object({})
});

export const updateProjectSchema = z.object({
	body: z
		.object({
			name: z.string().trim().min(2).max(120).optional(),
			description: z.string().trim().max(1000).optional()
		})
		.refine((value) => Object.keys(value).length > 0, {
			message: 'At least one field is required for update'
		}),
	params: z.object({
		id: objectIdSchema
	}),
	query: z.object({})
});

export const projectIdParamsSchema = z.object({
	body: z.object({}),
	params: z.object({
		id: objectIdSchema
	}),
	query: z.object({})
});

export const addProjectMemberSchema = z.object({
	body: z.object({
		userId: objectIdSchema
	}),
	params: z.object({
		id: objectIdSchema
	}),
	query: z.object({})
});

export const listProjectsQuerySchema = z.object({
	body: z.object({}),
	params: z.object({}),
	query: z.object({
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10)
	})
});

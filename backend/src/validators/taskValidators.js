import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid ObjectId');
const dateSchema = z.string().datetime({ offset: true }).or(z.string().date());
const emptyObject = z.object({});
const taskParams = z.object({ id: objectIdSchema });

export const createTaskSchema = z.object({
	body: z.object({
		title: z.string().trim().min(2).max(180),
		description: z.string().trim().max(2000).optional().default(''),
		project: objectIdSchema,
		assignedTo: objectIdSchema.nullable().optional().default(null),
		status: z.enum(['todo', 'in_progress', 'completed']).optional().default('todo'),
		priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
		dueDate: dateSchema.nullable().optional().default(null)
	}),
	params: emptyObject,
	query: emptyObject
});

export const updateTaskSchema = z.object({
	body: z
		.object({
			title: z.string().trim().min(2).max(180).optional(),
			description: z.string().trim().max(2000).optional(),
			priority: z.enum(['low', 'medium', 'high']).optional(),
			dueDate: dateSchema.nullable().optional()
		})
		.refine((value) => Object.keys(value).length > 0, {
			message: 'At least one field is required for update'
		}),
	params: taskParams,
	query: emptyObject
});

export const taskIdParamsSchema = z.object({
	body: emptyObject,
	params: taskParams,
	query: emptyObject
});

export const changeTaskStatusSchema = z.object({
	body: z.object({
		status: z.enum(['todo', 'in_progress', 'completed'])
	}),
	params: taskParams,
	query: emptyObject
});

export const assignTaskSchema = z.object({
	body: z.object({
		userId: objectIdSchema.nullable()
	}),
	params: taskParams,
	query: emptyObject
});

export const listTasksSchema = z.object({
	body: emptyObject,
	params: emptyObject,
	query: z.object({
		status: z.enum(['todo', 'in_progress', 'completed']).optional(),
		priority: z.enum(['low', 'medium', 'high']).optional(),
		project: objectIdSchema.optional(),
		page: z.coerce.number().int().min(1).default(1),
		limit: z.coerce.number().int().min(1).max(100).default(10)
	})
});

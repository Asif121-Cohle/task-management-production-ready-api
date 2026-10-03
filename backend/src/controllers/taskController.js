import {
	assignTask,
	changeTaskStatus,
	createTask,
	deleteTask,
	getTaskById,
	listTasks,
	updateTask
} from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createTaskHandler = asyncHandler(async (req, res) => {
	const task = await createTask(req.user, req.body);

	res.status(201).json({
		success: true,
		message: 'Task created successfully',
		data: task
	});
});

export const listTasksHandler = asyncHandler(async (req, res) => {
	const result = await listTasks(req.user, req.query);

	res.status(200).json({
		success: true,
		message: 'Tasks retrieved successfully',
		data: result.items,
		meta: result.pagination
	});
});

export const getTaskHandler = asyncHandler(async (req, res) => {
	const task = await getTaskById(req.params.id, req.user);

	res.status(200).json({
		success: true,
		message: 'Task retrieved successfully',
		data: task
	});
});

export const updateTaskHandler = asyncHandler(async (req, res) => {
	const task = await updateTask(req.params.id, req.user, req.body);

	res.status(200).json({
		success: true,
		message: 'Task updated successfully',
		data: task
	});
});

export const deleteTaskHandler = asyncHandler(async (req, res) => {
	await deleteTask(req.params.id, req.user);

	res.status(200).json({
		success: true,
		message: 'Task deleted successfully',
		data: null
	});
});

export const changeTaskStatusHandler = asyncHandler(async (req, res) => {
	const task = await changeTaskStatus(req.params.id, req.user, req.body.status);

	res.status(200).json({
		success: true,
		message: 'Task status updated successfully',
		data: task
	});
});

export const assignTaskHandler = asyncHandler(async (req, res) => {
	const task = await assignTask(req.params.id, req.user, req.body.userId);

	res.status(200).json({
		success: true,
		message: req.body.userId ? 'Task assigned successfully' : 'Task unassigned successfully',
		data: task
	});
});

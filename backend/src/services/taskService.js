import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const projectAccessFilter = (user) => {
	if (user.role === 'admin') {
		return {};
	}

	return {
		$or: [{ owner: user.id }, { members: user.id }]
	};
};

const getAccessibleProject = async (projectId, user) => {
	const project = await Project.findOne({ _id: projectId, ...projectAccessFilter(user) });

	if (!project) {
		throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
	}

	return project;
};

const getTaskForUser = async (taskId, user) => {
	const task = await Task.findById(taskId);

	if (!task) {
		throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND');
	}

	await getAccessibleProject(task.project, user);
	return task;
};

const populateTask = (query) => query.populate('project', 'name owner members').populate('assignedTo', 'name email role');

const ensureAssigneeCanAccessProject = (project, assignedTo) => {
	if (!assignedTo) {
		return;
	}

	const isMember = project.members.some((memberId) => memberId.toString() === assignedTo);
	const isOwner = project.owner.toString() === assignedTo;

	if (!isMember && !isOwner) {
		throw new ApiError(422, 'Assigned user must be a project member', 'ASSIGNEE_NOT_PROJECT_MEMBER');
	}
};

export const createTask = async (user, payload) => {
	const project = await getAccessibleProject(payload.project, user);
	ensureAssigneeCanAccessProject(project, payload.assignedTo);

	if (payload.assignedTo) {
		const assignedUser = await User.exists({ _id: payload.assignedTo });
		if (!assignedUser) {
			throw new ApiError(404, 'Assigned user not found', 'USER_NOT_FOUND');
		}
	}

	const task = await Task.create({ ...payload, dueDate: payload.dueDate ? new Date(payload.dueDate) : null });
	return populateTask(Task.findById(task._id));
};

export const listTasks = async (user, filters) => {
	const accessibleProjects = await Project.find(projectAccessFilter(user)).select('_id').lean();
	const accessibleProjectIds = accessibleProjects.map((project) => project._id);
	const filter = {
		project: filters.project
			? { $in: accessibleProjectIds.filter((id) => id.toString() === filters.project) }
			: { $in: accessibleProjectIds }
	};

	if (filters.status) {
		filter.status = filters.status;
	}
	if (filters.priority) {
		filter.priority = filters.priority;
	}

	const skip = (filters.page - 1) * filters.limit;
	const [items, total] = await Promise.all([
		populateTask(Task.find(filter).sort({ createdAt: -1 }).skip(skip).limit(filters.limit)),
		Task.countDocuments(filter)
	]);

	return {
		items,
		pagination: {
			page: filters.page,
			limit: filters.limit,
			total,
			totalPages: Math.ceil(total / filters.limit) || 1
		}
	};
};

export const getTaskById = async (taskId, user) => {
	const task = await getTaskForUser(taskId, user);
	return populateTask(Task.findById(task._id));
};

export const updateTask = async (taskId, user, payload) => {
	const task = await getTaskForUser(taskId, user);

	Object.assign(task, payload);
	if (payload.dueDate !== undefined) {
		task.dueDate = payload.dueDate ? new Date(payload.dueDate) : null;
	}

	await task.save();
	return populateTask(Task.findById(task._id));
};

export const deleteTask = async (taskId, user) => {
	const task = await getTaskForUser(taskId, user);
	await task.deleteOne();
};

export const changeTaskStatus = async (taskId, user, status) => {
	const task = await getTaskForUser(taskId, user);
	task.status = status;
	await task.save();
	return populateTask(Task.findById(task._id));
};

export const assignTask = async (taskId, user, userId) => {
	const task = await getTaskForUser(taskId, user);
	const project = await getAccessibleProject(task.project, user);

	if (userId) {
		const assignedUser = await User.exists({ _id: userId });
		if (!assignedUser) {
			throw new ApiError(404, 'Assigned user not found', 'USER_NOT_FOUND');
		}
		ensureAssigneeCanAccessProject(project, userId);
	}

	task.assignedTo = userId;
	await task.save();
	return populateTask(Task.findById(task._id));
};

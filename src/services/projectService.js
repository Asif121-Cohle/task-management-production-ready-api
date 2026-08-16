import Project from '../models/Project.js';
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

const canViewProjectQuery = (user) => {
	if (user.role === 'admin') {
		return {};
	}

	return {
		$or: [{ owner: user.id }, { members: user.id }]
	};
};

const requireProjectForView = async (projectId, user) => {
	const query = {
		_id: projectId,
		...canViewProjectQuery(user)
	};

	const project = await Project.findOne(query)
		.populate('owner', 'name email role')
		.populate('members', 'name email role');

	if (!project) {
		throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
	}

	return project;
};

const requireProjectManagementPermission = (project, user) => {
	if (user.role === 'admin') {
		return;
	}

	if (project.owner.toString() !== user.id) {
		throw new ApiError(403, 'Only project owner or admin can modify this project', 'FORBIDDEN');
	}
};

export const createProject = async (user, payload) => {
	const project = await Project.create({
		name: payload.name,
		description: payload.description || '',
		owner: user.id,
		members: [user.id]
	});

	return Project.findById(project._id).populate('owner', 'name email role').populate('members', 'name email role');
};

export const listProjects = async (user, { page, limit }) => {
	const filter = canViewProjectQuery(user);
	const skip = (page - 1) * limit;

	const [items, total] = await Promise.all([
		Project.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate('owner', 'name email role')
			.populate('members', 'name email role'),
		Project.countDocuments(filter)
	]);

	return {
		items,
		pagination: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit) || 1
		}
	};
};

export const getProjectById = async (projectId, user) => {
	return requireProjectForView(projectId, user);
};

export const updateProject = async (projectId, user, payload) => {
	const project = await Project.findById(projectId);
	if (!project) {
		throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
	}

	requireProjectManagementPermission(project, user);

	if (payload.name !== undefined) {
		project.name = payload.name;
	}
	if (payload.description !== undefined) {
		project.description = payload.description;
	}

	await project.save();

	return Project.findById(project._id).populate('owner', 'name email role').populate('members', 'name email role');
};

export const deleteProject = async (projectId, user) => {
	const project = await Project.findById(projectId);
	if (!project) {
		throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
	}

	requireProjectManagementPermission(project, user);
	await project.deleteOne();
};

export const addProjectMember = async (projectId, user, memberUserId) => {
	const project = await Project.findById(projectId);
	if (!project) {
		throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
	}

	requireProjectManagementPermission(project, user);

	const member = await User.findById(memberUserId).select('name email role');
	if (!member) {
		throw new ApiError(404, 'Member user not found', 'USER_NOT_FOUND');
	}

	const alreadyMember = project.members.some((id) => id.toString() === memberUserId);
	if (!alreadyMember) {
		project.members.push(memberUserId);
		await project.save();
	}

	return Project.findById(project._id).populate('owner', 'name email role').populate('members', 'name email role');
};

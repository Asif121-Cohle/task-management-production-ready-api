import {
	addProjectMember,
	createProject,
	deleteProject,
	getProjectById,
	listProjects,
	updateProject
} from '../services/projectService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createProjectHandler = asyncHandler(async (req, res) => {
	const project = await createProject(req.user, req.body);

	res.status(201).json({
		success: true,
		message: 'Project created successfully',
		data: project
	});
});

export const listProjectsHandler = asyncHandler(async (req, res) => {
	const result = await listProjects(req.user, req.query);

	res.status(200).json({
		success: true,
		message: 'Projects retrieved successfully',
		data: result.items,
		meta: result.pagination
	});
});

export const getProjectHandler = asyncHandler(async (req, res) => {
	const project = await getProjectById(req.params.id, req.user);

	res.status(200).json({
		success: true,
		message: 'Project retrieved successfully',
		data: project
	});
});

export const updateProjectHandler = asyncHandler(async (req, res) => {
	const project = await updateProject(req.params.id, req.user, req.body);

	res.status(200).json({
		success: true,
		message: 'Project updated successfully',
		data: project
	});
});

export const deleteProjectHandler = asyncHandler(async (req, res) => {
	await deleteProject(req.params.id, req.user);

	res.status(200).json({
		success: true,
		message: 'Project deleted successfully',
		data: null
	});
});

export const addProjectMemberHandler = asyncHandler(async (req, res) => {
	const project = await addProjectMember(req.params.id, req.user, req.body.userId);

	res.status(200).json({
		success: true,
		message: 'Project member added successfully',
		data: project
	});
});

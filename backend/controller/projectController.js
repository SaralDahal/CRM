import { find, findById, create, findByIdAndUpdate } from '../models/project.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export async function getProjects(req, res) {
    try {
        const projects = await find()
            .populate('client', 'name company')
            .populate('createdBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export async function getProject(req, res) {
    try {
        const project = await findById(req.params.id)
            .populate('client', 'name company email phone')
            .populate('createdBy', 'name email');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin)
export async function createProject(req, res) {
    try {
        req.body.createdBy = req.user.id;
        const project = await create(req.body);

        const populatedProject = await findById(project._id)
            .populate('client', 'name company')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            data: populatedProject
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
export async function updateProject(req, res) {
    try {
        let project = await findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        project = await findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('client', 'name company').populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
export async function deleteProject(req, res) {
    try {
        const project = await findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        await project.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
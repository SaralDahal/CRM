import Project from '../models/project.js';

// Get all projects
export async function getProjects(req, res) {
    try {
        const projects = await Project.find()
            .populate('client', 'name company')
            .populate('createdBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get single project
export async function getProject(req, res) {
    try {
        const project = await Project.findById(req.params.id)
            .populate('client', 'name company email phone')
            .populate('createdBy', 'name email');

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Create project
export async function createProject(req, res) {
    try {
        req.body.createdBy = req.user.id;

        const project = await Project.create(req.body);

        const populatedProject = await Project.findById(project._id)
            .populate('client', 'name company')
            .populate('createdBy', 'name email');

        res.status(201).json({ success: true, data: populatedProject });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update project
export async function updateProject(req, res) {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('client', 'name company')
            .populate('createdBy', 'name email');

        res.status(200).json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Delete project
export async function deleteProject(req, res) {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        await project.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}
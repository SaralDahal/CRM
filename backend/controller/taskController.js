import Task from '../models/Task.js';
// import { find, findById, create, findByIdAndUpdate } from '../models/Task';

// @desc    Get all tasks (filtered by role)
// @route   GET /api/tasks
// @access  Private
export async function getTasks(req, res) {
    try {
        const { find, findById, create, findByIdAndUpdate } = req.body;
        let query = {};

        // If employee, only show assigned tasks
        if (req.user.role === 'employee') {
            query.assignedTo = req.user.id;
        }

        const tasks = await find(query)
            .populate('project', 'title status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Get tasks by project
// @route   GET /api/tasks/project/:projectId
// @access  Private
export async function getTasksByProject(req, res) {
    try {
        
        const tasks = await find({ project: req.params.projectId })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export async function getTask(req, res) {
    try {
        const task = await findById(req.params.id)
            .populate('project', 'title status client')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Check if employee is trying to access other's task
        if (req.user.role === 'employee' && task.assignedTo._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this task'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin)
export async function createTask(req, res) {
    try {
        req.body.createdBy = req.user.id;
        const task = await create(req.body);

        const populatedTask = await findById(task._id)
            .populate('project', 'title status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            data: populatedTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export async function updateTask(req, res) {
    try {
        let task = await findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // If employee, only allow updating status
        if (req.user.role === 'employee') {
            if (task.assignedTo.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this task'
                });
            }
            // Only allow status update for employees
            req.body = { status: req.body.status };
        }

        task = await findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('project', 'title status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
export async function deleteTask(req, res) {
    try {
        const task = await findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        await task.deleteOne();

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
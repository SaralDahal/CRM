import Task from '../models/Task.js';

// Get all tasks
export async function getTasks(req, res) {
    try {
        let query = {};

        if (req.user.role === 'employee') {
            query.assignedTo = req.user.id;
        }

        const tasks = await Task.find(query)
            .populate('project', 'title status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .sort('-createdAt');

        res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Get task by ID
export async function getTask(req, res) {
    try {
        const task = await Task.findById(req.params.id)
            .populate('project', 'title status client')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (req.user.role === 'employee' && task.assignedTo.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Create task
export async function createTask(req, res) {
    try {
        req.body.createdBy = req.user.id;

        const task = await Task.create(req.body);

        const populatedTask = await Task.findById(task._id)
            .populate('project', 'title status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(201).json({ success: true, data: populatedTask });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update task
export async function updateTask(req, res) {
    try {
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        if (req.user.role === 'employee') {
            if (task.assignedTo.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
            req.body = { status: req.body.status };
        }

        task = await Task.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })
            .populate('project', 'title status')
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

        res.status(200).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Delete task
export async function deleteTask(req, res) {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found' });
        }

        await task.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

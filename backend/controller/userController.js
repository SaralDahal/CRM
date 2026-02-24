import { find, findById, findByIdAndUpdate } from '../models/User';

// @desc    Get all users (employees)
// @route   GET /api/users
// @access  Private (Admin)
export async function getUsers(req, res) {
    try {
        const users = await find().select('-password').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Get employees only
// @route   GET /api/users/employees
// @access  Private (Admin)
export async function getEmployees(req, res) {
    try {
        const employees = await find({ role: 'employee' }).select('-password').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: employees.length,
            data: employees
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
export async function getUser(req, res) {
    try {
        const user = await findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export async function updateUser(req, res) {
    try {
        // Don't allow password update through this route
        delete req.body.password;

        let user = await findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user = await findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select('-password');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export async function deleteUser(req, res) {
    try {
        const user = await findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

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
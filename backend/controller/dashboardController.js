import Client from '../models/Client.js';
import Project from '../models/project.js';
import Task from '../models/Task.js';
import User from '../models/user.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export async function getDashboardStats(req, res) {
    try {
        const stats = {};

        if (req.user.role === 'admin') {
            // Admin stats
            const [
                totalClients,
                totalProjects,
                ongoingProjects,
                completedProjects,
                totalTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                totalEmployees
            ] = await Promise.all([
                Client.countDocuments(),
                Project.countDocuments(),
                Project.countDocuments({ status: 'Ongoing' }),
                Project.countDocuments({ status: 'Completed' }),
                Task.countDocuments(),
                Task.countDocuments({ status: 'Pending' }),
                Task.countDocuments({ status: 'In Progress' }),
                Task.countDocuments({ status: 'Completed' }),
                User.countDocuments({ role: 'employee' })
            ]);

            stats.totalClients = totalClients;
            stats.totalProjects = totalProjects;
            stats.ongoingProjects = ongoingProjects;
            stats.completedProjects = completedProjects;
            stats.planningProjects = totalProjects - ongoingProjects - completedProjects;
            stats.totalTasks = totalTasks;
            stats.pendingTasks = pendingTasks;
            stats.inProgressTasks = inProgressTasks;
            stats.completedTasks = completedTasks;
            stats.totalEmployees = totalEmployees;

            // Recent projects
            stats.recentProjects = await Project.find()
                .populate('client', 'name company')
                .sort('-createdAt')
                .limit(5);

            // Task distribution by status
            stats.taskDistribution = {
                pending: pendingTasks,
                inProgress: inProgressTasks,
                completed: completedTasks
            };

        } else {
            // Employee stats
            const userId = req.user.id;

            const [
                totalAssignedTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks,
                dueSoonTasks
            ] = await Promise.all([
                Task.countDocuments({ assignedTo: userId }),
                Task.countDocuments({ assignedTo: userId, status: 'Pending' }),
                Task.countDocuments({ assignedTo: userId, status: 'In Progress' }),
                Task.countDocuments({ assignedTo: userId, status: 'Completed' }),
                Task.countDocuments({
                    assignedTo: userId,
                    status: { $ne: 'Completed' },
                    dueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
                })
            ]);

            stats.totalAssignedTasks = totalAssignedTasks;
            stats.pendingTasks = pendingTasks;
            stats.inProgressTasks = inProgressTasks;
            stats.completedTasks = completedTasks;
            stats.dueSoonTasks = dueSoonTasks;

            // Recent tasks
            stats.recentTasks = await Task.find({ assignedTo: userId })
                .populate('project', 'title status')
                .sort('-createdAt')
                .limit(5);

            // Task distribution by status
            stats.taskDistribution = {
                pending: pendingTasks,
                inProgress: inProgressTasks,
                completed: completedTasks
            };
        }

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}
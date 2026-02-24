import Client from '../models/Client.js';

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private (Admin)
export async function getClients(req, res) {
    try {
        const clients = await Client.find().populate('createdBy', 'name email').sort('-createdAt');

        res.status(200).json({
            success: true,
            count: clients.length,
            data: clients
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Private (Admin)
export async function getClient(req, res) {
    try {
        const client = await Client.findById(req.params.id).populate('createdBy', 'name email');

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            data: client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Create new client
// @route   POST /api/clients
// @access  Private (Admin)
export async function createClient(req, res) {
    try {
        req.body.createdBy = req.user.id;
        const client = await Client.create(req.body);

        res.status(201).json({
            success: true,
            data: client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Private (Admin)
export async function updateClient(req, res) {
    try {
        let client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        client = await Client.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: client
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// @desc    Delete client
// @route   DELETE /api/clients/:id
// @access  Private (Admin)
export async function deleteClient(req, res) {
    try {
        const client = await Client.findById(req.params.id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        await client.deleteOne();

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
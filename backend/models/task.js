import { Schema, model } from 'mongoose';

const taskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, 'Project is required']
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Assigned user is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed'],
        default: 'Pending'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default model('Task', taskSchema);
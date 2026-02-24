import { Schema, model } from 'mongoose';

const projectSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true
    },
    client: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: [true, 'Client is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required']
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: 0
    },
    status: {
        type: String,
        enum: ['Planning', 'Ongoing', 'Completed'],
        default: 'Planning'
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default model('Project', projectSchema);
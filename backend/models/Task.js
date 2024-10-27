const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    taskName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    },
    participants: [{
        participantId: {
            type: Schema.Types.ObjectId,
            ref: 'Developer'  // Assuming participants are developers; adjust if needed
        },
       
    }],
    status: {
        type: String,
        enum: ['Assigned', 'Started', 'In-Progress', 'Completed', 'Testing'],
        default: 'Assigned'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, { timestamps: true });

const Task = mongoose.model('Task', TaskSchema);

module.exports = Task;

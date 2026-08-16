import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 180
		},
		description: {
			type: String,
			trim: true,
			maxlength: 2000,
			default: ''
		},
		project: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Project',
			required: true,
			index: true
		},
		assignedTo: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
			index: true
		},
		status: {
			type: String,
			enum: ['todo', 'in_progress', 'completed'],
			default: 'todo',
			index: true
		},
		priority: {
			type: String,
			enum: ['low', 'medium', 'high'],
			default: 'medium',
			index: true
		},
		dueDate: {
			type: Date,
			default: null
		}
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_doc, ret) => {
				delete ret.__v;
				return ret;
			}
		}
	}
);

taskSchema.index({ project: 1, status: 1, priority: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;

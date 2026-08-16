import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 120
		},
		description: {
			type: String,
			trim: true,
			maxlength: 1000,
			default: ''
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true
		},
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				index: true
			}
		]
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

projectSchema.index({ owner: 1, createdAt: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;

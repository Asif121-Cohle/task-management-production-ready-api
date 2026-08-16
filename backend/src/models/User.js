import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			minlength: 2,
			maxlength: 100
		},
		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
			index: true
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			select: false
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
			index: true
		}
	},
	{
		timestamps: true,
		toJSON: {
			transform: (_doc, ret) => {
				delete ret.password;
				delete ret.__v;
				return ret;
			}
		}
	}
);

userSchema.pre('save', async function preSave(next) {
	if (!this.isModified('password')) {
		next();
		return;
	}

	this.password = await bcrypt.hash(this.password, 12);
	next();
});

userSchema.methods.comparePassword = async function comparePassword(plainPassword) {
	return bcrypt.compare(plainPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

import mongoose from 'mongoose';

const UserSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    phone: {
        type: String,
        default: ''
    },
    notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        reminders: { type: Boolean, default: true }
    },
    preferences: {
        defaultLocation: { type: String, default: '' },
        paymentMethod: { type: String, default: 'card' },
        autoExtend: { type: Boolean, default: false }
    }
}, {
    timestamps: true
});

export default mongoose.model('UserSettings', UserSettingsSchema);
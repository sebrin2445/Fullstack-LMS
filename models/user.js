const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Fullname: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], required: true },
    subject: { type: String }, // For teachers
    approved: { type: Boolean, default: false } // For admin approval
});

module.exports = mongoose.model('User', userSchema);

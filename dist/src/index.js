"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("./models/User");
const Topic_1 = require("./models/Topic");
const inputValidation_1 = __importDefault(require("./validators/inputValidation"));
const express_validator_1 = require("express-validator");
const validateToken_1 = require("./middleware/validateToken");
const router = (0, express_1.Router)();
router.post('/api/user/register/', inputValidation_1.default.register, async (req, res) => {
    const { email, password, username, isAdmin } = req.body;
    console.log(req.body);
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        res.status(400).json({ errors: errors.array() });
        return;
    }
    if (!email || !password) {
        res.status(400).json({ message: 'No email or password' });
        return;
    }
    const userExists = await User_1.User.findOne({ email });
    if (userExists) {
        res.status(403).json({ message: 'Email is already registered' });
        return;
    }
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = new User_1.User({
            email,
            password: hashedPassword,
            username,
            isAdmin: isAdmin !== undefined ? isAdmin : false
        });
        await newUser.save();
        res.status(200).json(newUser);
        return;
    }
    catch (error) {
        console.log(error);
    }
});
router.post('/api/user/login', inputValidation_1.default.login, async (req, res) => {
    const { email, password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    if (!email || !password) {
        res.status(400).json({ message: 'No email or password' });
        return;
    }
    try {
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id, username: user.username, isadmin: user.isAdmin }, process.env.SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
        return;
    }
    catch (error) {
        console.log(error);
    }
});
router.post('/api/user/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: "Logged out successfully" });
    return;
});
router.get('/api/topics', async (req, res) => {
    try {
        const topics = await Topic_1.Topic.find();
        res.status(200).json(topics);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching topics.', error });
    }
});
router.post('/api/topic', validateToken_1.authenticateUser, async (req, res) => {
    try {
        const { title, content, username } = req.body;
        const newTopic = new Topic_1.Topic({
            title,
            content,
            username: req.user.username,
        });
        await newTopic.save();
        res.status(200).json(newTopic);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating topic.', error });
    }
});
router.delete('/api/topic/:id', validateToken_1.authenticateAdmin, async (req, res) => {
    try {
        console.log("Server deleting topic");
        const { id } = req.params;
        const deletedTopic = await Topic_1.Topic.findByIdAndDelete(id);
        if (!deletedTopic) {
            res.status(404).json({ message: 'Topic not found.' });
            return;
        }
        res.status(200).json({ message: 'Topic deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting topic.', error });
    }
});
exports.default = router;

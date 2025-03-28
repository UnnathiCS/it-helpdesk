require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ["employee", "it_staff"], default: "employee" }
});
const User = mongoose.model('User', UserSchema);

// Ticket Schema
const TicketSchema = new mongoose.Schema({
    title: String,
    description: String,
    department: String,
    category: String,
    status: { type: String, default: "Open" }, // NEW FIELD
    createdAt: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', TicketSchema);

// Register User
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = new User({ name, email, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: "✅ User Registered" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login User
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ error: "❌ Invalid Credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, "secret_key", { expiresIn: "1h" });
    res.json({ message: "✅ Login Successful", token, role: user.role });
});

// Middleware for Authentication
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "❌ Unauthorized" });

    try {
        const decoded = jwt.verify(token, "secret_key");
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "❌ Invalid Token" });
    }
};

// Create Ticket (Employees only)
app.post('/tickets', authenticate, async (req, res) => {
    if (req.user.role !== "employee") return res.status(403).json({ error: "❌ Only employees can create tickets" });

    const ticket = new Ticket(req.body);
    await ticket.save();
    res.json({ message: "✅ Ticket Created", ticket });
});

// Get All Tickets (IT Staff only)
app.get('/tickets', authenticate, async (req, res) => {
    if (req.user.role !== "it_staff") return res.status(403).json({ error: "❌ Access Denied" });

    const tickets = await Ticket.find();
    res.json(tickets);
});

// Update Ticket Status (IT Staff only)
app.put('/tickets/:id', authenticate, async (req, res) => {
    if (req.user.role !== "it_staff") return res.status(403).json({ error: "❌ Access Denied" });

    await Ticket.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "✅ Ticket Updated" });
});

// Delete Ticket (IT Staff only)
app.delete('/tickets/:id', authenticate, async (req, res) => {
    if (req.user.role !== "it_staff") return res.status(403).json({ error: "❌ Access Denied" });

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Ticket Deleted" });
});

// Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));

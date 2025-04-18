require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Default route to serve the frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MongoDB Connection
mongoose.connect('mongodb://host.docker.internal:27017/it-helpdesk', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
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
    status: { type: String, default: "Open" },
    createdAt: { type: Date, default: Date.now },
    createdBy: String,
    createdByName: String,
});
const Ticket = mongoose.model('Ticket', TicketSchema);
//Ticketchat
const TicketChatSchema = new mongoose.Schema({
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    senderId: String,
    senderName: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});
const TicketChat = mongoose.model('TicketChat', TicketChatSchema);

// Register
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

// Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ error: "❌ Invalid Credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role, name: user.name }, "secret_key", { expiresIn: "1h" });
    res.json({ 
        message: "✅ Login Successful", 
        token, 
        role: user.role, 
        name: user.name // Include the user's name in the response
    });
});

// Auth Middleware
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

// Create Ticket (Employee)
app.post('/tickets', authenticate, async (req, res) => {
    if (req.user.role !== "employee")
        return res.status(403).json({ error: "❌ Only employees can create tickets" });

    const ticket = new Ticket({
        ...req.body,
        createdBy: req.user.userId, // Extract userId from the token
        createdByName: req.user.name // Extract user name from the token
    });

    try {
        await ticket.save();
        res.json({ message: "✅ Ticket Created", ticket });
    } catch (error) {
        res.status(500).json({ error: "Error creating ticket" });
    }
});

// View Own Tickets (Employee)
app.get('/my-tickets', authenticate, async (req, res) => {
    try {
        const tickets = await Ticket.find({ createdBy: req.user.userId });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tickets' });
    }
});

// View All Tickets (IT Staff)
app.get('/tickets', authenticate, async (req, res) => {
    if (req.user.role !== "it_staff")
        return res.status(403).json({ error: "❌ Access Denied" });

    const tickets = await Ticket.find();
    res.json(tickets);
});

// Update Ticket Status (IT Staff)
app.put('/tickets/:id', authenticate, async (req, res) => {
    if (req.user.role !== "it_staff")
        return res.status(403).json({ error: "❌ Access Denied" });

    await Ticket.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "✅ Ticket Updated" });
});

// Delete Ticket (IT Staff)
app.delete('/tickets/:id', authenticate, async (req, res) => {
    if (req.user.role !== "it_staff")
        return res.status(403).json({ error: "❌ Access Denied" });

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Ticket Deleted" });
});
// Send message for a specific ticket
app.post('/tickets/:id/chat', authenticate, async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    // Only allow ticket owner or IT staff
    if (req.user.role !== 'it_staff' && ticket.createdBy !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
    }

    const chat = new TicketChat({
        ticketId: req.params.id,
        senderId: req.user.userId,
        senderName: req.user.name,
        message
    });

    await chat.save();
    res.json({ message: "Message sent", chat });
});

// Get all messages for a ticket
app.get('/tickets/:id/chat', authenticate, async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    if (req.user.role !== 'it_staff' && ticket.createdBy !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
    }

    const chats = await TicketChat.find({ ticketId: req.params.id }).sort({ createdAt: 1 });
    res.json(chats);
});

  

// Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
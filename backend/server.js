require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.log(err));

// Ticket Schema
const TicketSchema = new mongoose.Schema({
    title: String,
    description: String,
    department: String, // NEW FIELD
    category: String, // NEW FIELD
    status: { type: String, default: "Open" },
    createdAt: { type: Date, default: Date.now }
});
const Ticket = mongoose.model('Ticket', TicketSchema);

// API Routes

// Create Ticket
app.post('/tickets', async (req, res) => {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.json({ message: "✅ Ticket Created", ticket });
});

// Get All Tickets
app.get('/tickets', async (req, res) => {
    const tickets = await Ticket.find();
    res.json(tickets);
});

// Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));

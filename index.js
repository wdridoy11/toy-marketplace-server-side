const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { config } = require("dotenv");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v2v9b72.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const toyMarketplaceCollection = client
      .db("toyMarketplaceDB")
      .collection("toyMarketplaces");

    // toy data get
    app.get("/toyMarketplace", async (req, res) => {
      const result = await toyMarketplaceCollection.find().toArray();
      res.send(result);
    });

    //specific user specific data
    app.get("/mytoyMarketplace", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toyMarketplaceCollection.find(query).toArray();
      res.send(result);
    });

    // toy data post
    app.post("/toyMarketplace", async (req, res) => {
      const body = req.body;
      const result = await toyMarketplaceCollection.insertOne(body);
      res.send(result);
    });

    // Toy find specific data using id
    app.get("/toyMarketplace/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyMarketplaceCollection.findOne(filter);
      res.send(result);
    });

    // toy data update
    app.put("/toyMarketplace/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const updateDoc = {
        $set: {
          name: body.name,
          pictureUrl: body.pictureUrl,
          sellerName: body.sellerName,
          sellerEmail: body.sellerEmail,
          price: body.price,
          quantity: body.quantity,
          description: body.description,
          selectedValue: body.selectedValue,
          reatingValue: body.reatingValue,
        },
      };
      const result = await toyMarketplaceCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // toy data delete
    app.delete("/toyMarketplace/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyMarketplaceCollection.deleteOne(filter);
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
  res.send("Server is running");
});

app.listen(port, () => {
  console.log("Server is running port number:", port);
});

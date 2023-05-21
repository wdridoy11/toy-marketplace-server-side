const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { config } = require("dotenv");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    client.connect();

    const toyMarketplaceCollection = client
      .db("toyMarketplaceDB")
      .collection("toyMarketplaces");

    // toys get data
    app.get("/toys", async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = page * limit;
      const result = await toyMarketplaceCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    // total toys count
    app.get("/totalToys", async (req, res) => {
      const result = await toyMarketplaceCollection.estimatedDocumentCount();
      res.send({ totalToys: result });
    });

    // filter data using category
    app.get("/categorys/:text", async (req, res) => {
      let category = req.params.text;
      const result = await toyMarketplaceCollection
        .find({ categoryValue: category })
        .toArray();
      res.send(result);
    });

    // sorting by price
    app.get("/myToys/:order", async (req, res) => {
      let result;
      if (req.params.order == "Ascending") {
        result = await toyMarketplaceCollection
          .find()
          .sort({ price: 1 })
          .toArray();
      } else if (req.params.order == "Descending") {
        result = await toyMarketplaceCollection
          .find()
          .sort({ price: -1 })
          .toArray();
      }
      res.send(result);
    });

    //specific user specific data using email
    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toyMarketplaceCollection.find(query).toArray();
      res.send(result);
    });

    // toys data post
    app.post("/toys", async (req, res) => {
      const body = req.body;
      const result = await toyMarketplaceCollection.insertOne({
        ...body,
        price: Number(body.price),
      });
      res.send(result);
    });

    // Toy find specific data using id
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await toyMarketplaceCollection.findOne(filter);
      res.send(result);
    });

    // toy data update
    app.put("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const body = req.body;
      const updateDoc = {
        $set: {
          price: body.price,
          quantity: body.quantity,
          description: body.description,
        },
      };
      const result = await toyMarketplaceCollection.updateOne(
        filter,
        updateDoc
      );
      res.send(result);
    });

    // toy name search
    app.get("/searyToys/:searchText", async (req, res) => {
      const searchText = req.params.searchText;
      const result = await toyMarketplaceCollection
        .find({
          $or: [{ toy_name: { $regex: searchText, $options: "i" } }],
        })
        .toArray();
      res.send(result);
    });

    // toy data delete
    app.delete("/toys/:id", async (req, res) => {
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

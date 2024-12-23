const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = "mongodb://127.0.0.1:27017/";

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );

        const foodCollection = client.db("foodCollection").collection("food");
        const foodPurchases = client
            .db("foodPurchases")
            .collection("purchased");

        app.post("/foods", async (req, res) => {
            const foodData = req.body;
            const result = await foodCollection.insertOne(foodData);
            res.send(result);
        });

        // //pending
        // app.patch("/food/:id", async (req, res) => {
        //     const totalPurchase = req.body;
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const options = { upsert: true };
        //     const updatedFood = {
        //         $set: {
        //             totalPurchase,
        //         },
        //     };
        //     const result = await foodCollection.findOneAndUpdate(
        //         filter,
        //         updatedFood,
        //         options
        //     );
        //     res.send(result);
        // });

        app.get("/foods", async (req, res) => {
            const result = await foodCollection.find().toArray();
            res.send({
                status: true,
                result,
            });
        });

        app.get("/food/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await foodCollection.findOne(filter);
            res.send({
                status: true,
                result,
            });
        });

        app.get("/my-foods", async (req, res) => {
            const email = req.query.email;
            const filter = { ownerEmail: email };
            const result = await foodCollection.find(filter).toArray();
            res.send(result);
        });

        app.get("/food", async (req, res) => {
            const foodName = req.query.search;
            const query = { name: { $regex: foodName, $options: "i" } };
            const result = await foodCollection.find(query).toArray();
            console.log(query, result);
            res.send(result);
        });

        app.post("/purchase-food", async (req, res) => {
            const data = req.body;
            const result = await foodPurchases.insertOne(data);
            res.send({
                status: true,
                result,
            });
        });
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Eatopia Server is running properly");
});

app.listen(port, () => {
    console.log(`Server is running properly on port: ${port}`);
});

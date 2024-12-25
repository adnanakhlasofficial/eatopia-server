const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;
const app = express();

app.use(
    cors({
        origin: ["http://localhost:5173"],
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    // console.log(token);

    if (!token) {
        return res.status(401).send({ message: "Unauthorized access" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decode) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized access" });
        }

        req.user = decode;
        next();
    });
};

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

        app.post("/login", (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: "5h",
            });
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
            }).send({ success: true });
        });

        app.post("/logout", (req, res) => {
            res.clearCookie("token", {
                httpOnly: true,
                secure: false,
            }).send({ success: true });
        });

        const foodCollection = client.db("foodCollection").collection("food");
        const foodPurchases = client
            .db("foodPurchases")
            .collection("purchased");

        app.post("/foods", async (req, res) => {
            const foodData = req.body;
            const result = await foodCollection.insertOne(foodData);
            res.send(result);
        });

        app.get("/count", async (req, res) => {
            const count = await foodCollection.estimatedDocumentCount();
            res.send({ count });
        });

        app.patch("/food/:id", async (req, res) => {
            const totalPurchase = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedFood = {
                $set: {
                    quantity: totalPurchase.remaining,
                    totalPurchase: totalPurchase.purchaseQuantity,
                },
            };
            const result = await foodCollection.findOneAndUpdate(
                filter,
                updatedFood,
                options
            );
            res.send(result);
        });

        app.get("/foods", async (req, res) => {
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const result = await foodCollection
                .find()
                .skip(page * size)
                .limit(size)
                .toArray();
            res.send({
                status: true,
                result,
            });
        });

        app.get("/limit-food", async (req, res) => {
            const result = await foodCollection
                .find()
                .sort({ totalPurchase: -1 })
                .limit(6)
                .toArray();
            res.send(result);
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

        app.put("/food/:id", async (req, res) => {
            const food = req.body;
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateFood = {
                $set: {
                    name: food.name,
                    image: food.image,
                    category: food.category,
                    quantity: food.quantity,
                    price: food.price,
                    ownerName: food.ownerName,
                    ownerEmail: food.ownerEmail,
                    origin: food.origin,
                    desc: food.desc,
                },
            };
            const result = await foodCollection.updateOne(
                filter,
                updateFood,
                options
            );
            res.send(result);
        });

        app.get("/my-foods", verifyToken, async (req, res) => {
            const email = req.query.email;

            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: "Access forbidden" });
            }

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

        app.delete("/purchase-delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodPurchases.deleteOne(query);
            res.send(result);
        });

        app.get("/orders", verifyToken, async (req, res) => {
            const email = req.query.email;

            if (req.user.email !== req.query.email) {
                return res.status(403).send({ message: "Access forbidden" });
            }

            const filter = { "buyer.email": email };
            const result = await foodPurchases.find(filter).toArray();
            res.send(result);
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

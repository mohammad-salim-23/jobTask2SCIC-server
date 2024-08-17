const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERS}:${process.env.DB_PASS}@cluster0.ipsrkdy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const userCollection = client.db("JobTask2").collection("users");
    const productCollection = client.db("JobTask2").collection("products");
    app.post('/users',async(req,res)=>{
        const user = req.body;
        user.status = 'user';
        // insert email id users doesn't exist
        const query = {email:user.email};
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
          console.log(existingUser);
        }
        const result = userCollection.insertOne(user);
        res.send(result);
      })
      app.get("/products", async (req, res) => {
        const { page = 1, limit = 6, search, brand, category, minPrice = 0, maxPrice = Infinity, sortBy } = req.query;
      
        const query = {};
      
        // Search
        if (search) {
          query.productName = { $regex: search, $options: "i" };
        }
      
        // Filters
        if (brand) {
          query.brand = brand;
        }
      
        if (category) {
          query.category = category;
        }
      
        if (minPrice !== undefined && maxPrice !== undefined) {
          query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
        }
      
        // Sorting
        const sortQuery = {};
        if (sortBy) {
          const [field, order] = sortBy.split(':');
          sortQuery[field] = order === 'asc' ? 1 : -1;
        } else {
          sortQuery.createdAt = -1; // Default sort by createdAt descending
        }
      
        // Pagination
        const skip = (page - 1) * limit;
        const totalProducts = await productCollection.countDocuments(query);
        const products = await productCollection.find(query).sort(sortQuery).skip(skip).limit(parseInt(limit)).toArray();
      
        res.send({
          products,
          totalProducts,
          totalPages: Math.ceil(totalProducts / limit),
          currentPage: parseInt(page),
        });
      });
      
    
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
    res.send("TechGadget is running");
  });
  app.listen(port, () => {
    console.log(`TechGadget is running on port ${port}`);
  });

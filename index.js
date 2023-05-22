const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000; 

// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.anttmlo.mongodb.net/?retryWrites=true&w=majority`;

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

    const toysCollection = client.db('toysDB').collection('toys');

    // get all toy
    app.get('/toys', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const result = await toysCollection.find().limit(limit).toArray();
      res.send(result);
    });

    // get serach toys
    app.get('/serach-toys', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const name = req.query.name; // Get the toy name from the query parameters
      let query = {};
      if (name) {
        // If toy name is provided, create a query to search by name
        query = { toyName: { $regex: name, $options: 'i' } }; // Case-insensitive search using regex
      }
      const result = await toysCollection.find(query).limit(limit).toArray();
      res.send(result);
    });

    // get toy by using id
    app.get('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}; 
      const result = await toysCollection.findOne(query);
      res.send(result);
    })

    // // get my toy and sort 
    app.get('/mytoys', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const sort = req.query.sort || 'asc'; // Default sort order is ascending
      const result = await toysCollection.find(query).sort({ price: sort === 'desc' ? -1 : 1 }).toArray();
      res.send(result);
    });

    // get toys by category
    app.get('/shop-category/:text', async (req, res) => {
      if (req.params.text == "sports-car" || req.params.text == "mini-fire-truck" || req.params.text == "police-car"){
        console.log(req.params.text);
        const result = await toysCollection.find({subCategory: req.params.text}).toArray();
        console.log(result);
        return res.send(result);
      } 
      const result = await toysCollection.find({}).toArray();
      res.send(result);
    });

    // add toy
    app.post('/toys', async (req, res) => {
      const newToys = req.body; 
      const result = await toysCollection.insertOne(newToys);
      res.send(result);
    })
    
    // update toy
    app.put('/mytoys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}; 
      const options = {upsert: true};
      const updatedToy = req.body;
      const toy = {
        $set: {
          price: updatedToy.price, 
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        }
      }
      const result = await toysCollection.updateOne(filter, toy, options);
      res.send(result); 
    })

    // delete my toy 
    app.delete('/mytoys/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}; 
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Car Is Running'); 
})

app.listen(port, () => {
  console.log(`Car Craze Is Running On Port ${port}`);
})
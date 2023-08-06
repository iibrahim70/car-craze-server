const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000; 

// middleware 
app.use(cors());
app.use(express.json());

const uri = process.env.mongodbUri

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

    const carsCollection = client.db('carsDB').collection('cars');
    const reviewsCollection = client.db('carsDB').collection('reviews');
    const newCarsCollection = client.db('carsDB').collection('newArrivals');

    // get all the cars
    app.get('/cars', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const result = await carsCollection.find().limit(limit).toArray();
      res.send(result);
    });

    // get all the the reviews
    app.get('/reviews', async (req, res) => {
      const limit = parseInt(req.query.limit) || 12;
      const result = await reviewsCollection.find().limit(limit).toArray();
      res.send(result);
    });

    // get all the new collections 
    app.get('/new-cars', async (req, res) => {
      const result = await newCarsCollection.find().toArray(); 
      res.send(result);
    })  

    // get cars by search 
    app.get('/serach-cars', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const name = req.query.name; 
      let query = {};
      if (name) {
        query = { carsName: { $regex: name, $options: 'i' } };
      }
      const result = await carsCollection.find(query).limit(limit).toArray();
      res.send(result);
    });

    // get car by using their id
    app.get('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}; 
      const result = await carsCollection.findOne(query);
      res.send(result);
    })

    // // get my cars and sort 
    app.get('/mycars', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const sort = req.query.sort || 'asc'; // Default sort order is ascending
      const result = await carsCollection.find(query).sort({ price: sort === 'desc' ? -1 : 1 }).toArray();
      res.send(result);
    });

    // add cars to the database
    app.post('/cars', async (req, res) => {
      const newCars = req.body; 
      const result = await carsCollection.insertOne(newCars);
      res.send(result);
    })
    
    // update toy
    app.put('/mycars/:id', async (req, res) => {
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
      const result = await carsCollection.updateOne(filter, toy, options);
      res.send(result); 
    })

    // delete my toy 
    app.delete('/mycars/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}; 
      const result = await carsCollection.deleteOne(query);
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
  res.send('Car Craze Is Running'); 
})

app.listen(port, () => {
  console.log(`Car Craze Is Running On Port ${port}`);
})
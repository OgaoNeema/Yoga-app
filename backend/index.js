const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;/*if port 5000 isn't available, 
the server will run on any other available one */

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@yoga-master.wr77y.mongodb.net/?retryWrites=true&w=majority&appName=yoga-master`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    // Creating the database
    const database = client.db("yoga-master");

    // Creating the collections eg users, classes
    const usersCollection = database.collection("users");
    const classesCollection = database.collection("classes");
    const cartCollection = database.collection("cart");
    const paymentCollection = database.collection("payment");
    const enrolledCollection = database.collection("enrolled");
    const appliedCollection = database.collection("applied");

    //CLASSES COLLECTION ROUTES
    //POST request
    app.post('/new-class', async (req, res) => {
      const newClass = req.body;
      const result = await classesCollection.insertOne(newClass);
      res.send(result);
    });

    //Get request for data with a status: approved
    app.get('/classes',async(req,res) => {
      const query = {status:'approved'}; //we query it based on the
      // status so that only the approved ones are shown... we are filtering
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    //Get request by instructor email(eg http://localhost:5000/classes/teylor@len.com)
    app.get('/classes/:email',async(req,res) => {
      const email =req.params.email;
      const query = {instructorEmail : email};
      const result = await classesCollection.find(query).toArray();
      res.send(result);
    })

    //manage classes
    //Get request of all data... no filter
    app.get('/classes-manage',async(req,res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    })

    //PATCH request to update classes status and reason
    app.patch('/change-status/:id', async(req,res) => {
      const id= req.params.id;
      const status = req.body.status;
      const reason = req.body.reason;
      const filter = {_id:new ObjectId(id)}
      const options = {upsert : true};
      const updateDoc = {
        $set:{
          status: status,
          reason: reason,
        },
      };
      const result = await classesCollection.updateOne(filter,updateDoc,options);
      res.send(result);
    })

    //PUT method to update all fields
    app.put('/update-class/:id', async(req,res) => {
      const id = request.params.id;
      const updateClass = req.bpdy;
      const filter = {_id:new ObjectId(id)}
      const options = {upsert : true};
      const updateDoc = {
        $set:{
          name:updateClass.name,
          price: updateClass.price,
          availableSeats: parseInt(updateClass.availableSeats),
          description: updateClass.description,
          status: 'pending',
          totalEnrolled: parseInt(updateClass.totalEnrolled),
          reason: updateClass.reason
        },
      };
      const result = await classesCollection.updateOne(filter,updateDoc,options);
      res.send(result);
    })

    //getting the details of a single class
    app.get('/class/:id',async(req,res) => {
            const id = req.params.id;
            const query = {_id:new ObjectId(id)};
            const result = await classesCollection.findOne(query);
            res.send(result);
    })

    //getting all the approved classes
    app.get('/approved-classes', async(req, res) => {
      const query = { status : 'approved'};
      const result = await classesCollection.find(query).toArray();//converting to array
      res.send(result);
    })

    //getting all the pending classes
    app.get('/pending-classes',async(req,res) => {
      const query = { status : 'pending'};
      const result = await classesCollection.find(query).toArray();//converting to array
      res.send(result);
    })

    //CARTS COLLECTION ROUTES
    //POST method for adding data
    app.post('/add-to-cart',async(req,res) => {
      const newItem = req.body;
      const result = await cartCollection.insertOne(newItem);
      res.send(result);
    })

    //GET method to retrieve data by id
    app.get('/cart-item/:id', async(req,res) => {
      const id = req.params.id;
      const email = req.body.email;
      const query = {
        classId: id,
        userMail: email
      }
      const projection = {classId: 1};
      const result = await cartCollection.findOne(query,{projection: projection});
      res.send(result);
    })

    console.log("Successfully connected to MongoDB!");
  } catch (err) {
    console.error(err);
  } 
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hi pookie!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
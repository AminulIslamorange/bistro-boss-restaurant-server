const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const  jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
dotenv.config()







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.n6usyvo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();

    const menuCollection = client.db("bistroDB").collection("menu");
    const reviewsCollection = client.db("bistroDB").collection("reviews");
    const cartsCollection = client.db("bistroDB").collection("carts");
    const userCollection = client.db("bistroDB").collection("users");
       
    // jwt related api

    app.post ('/jwt',async(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res.send({token});
    })
    
    
    
    //  menu related api




    app.get('/menu', async(req,res)=>{
        const result=await menuCollection.find().toArray();
        res.send(result)

    })
    app.get('/reviews', async(req,res)=>{
        const result=await reviewsCollection.find().toArray();
        res.send(result)

    });

    // carts collection related api


    app.get('/carts',async(req,res)=>{
      const email=req.query.email;
      const query={email:email}
      const result=await cartsCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/carts',async(req,res)=>{
      const cartItem=req.body;
      const result=await cartsCollection.insertOne(cartItem);
      res.send(result)
    });

    app.delete('/carts/:id',async(req,res)=>{
      const id=req.params.id;
      const query={_id : new ObjectId(id)}
      const result=await cartsCollection.deleteOne(query);
      res.send(result);
    });


    // user related api
    app.get('/users',async(req,res)=>{
      const result=await userCollection.find().toArray();
      res.send(result)

    })




    app.post('/users',async(req,res)=>{
      const user=req.body;
      // insert user if user doesnot exists
      const query={email:user.email}
      const existingUser=await userCollection.findOne(query);
      if(existingUser){
        return res.send({message:'User Alredy Exists',insertedId:'null'})
      }

      const result=await userCollection.insertOne(user);
      res.send(result);

    });

// make admin related api

app.patch('/users/admin/:id',async(req,res)=>{
  const id=req.params.id;
  const filter={_id:new ObjectId(id)};
  const updateDoc={
    $set: {
      role:'admin'
    },

  }
  const result=await userCollection.updateOne(filter,updateDoc);
  res.send(result)


})

//  delete user related api

app.delete('/users/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id:new ObjectId(id)}
  const result=await userCollection.deleteOne(query);
  res.send(result);

});







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
    res.send('server running');
});

app.listen(port, () => {
    console.log(`server running on port ${port}`);
});
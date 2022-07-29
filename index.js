const connectToMongo = require('./db');
const express = require('express');

connectToMongo();

const app = express();
const port = 5000;

// to use req.body
app.use(express.json());


app.use('/api/auth', require('./routes/auth.js'));

app.use('/api', require('./routes/area-page.js'));

app.listen(port, ()=>{
    console.log('Listening at port 5000');
})

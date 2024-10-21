require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');



const connectDB = require('./config/server');
app.listen(process.env.PORT || 8080, async()=>{
    connectDB();
    console.log('server started on PORT',process.env.PORT)
})
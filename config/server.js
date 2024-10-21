const mongoose = require('mongoose')
require('dotenv').config();
const connectDB=async()=>{
    try {
        const connect =await mongoose.connect(process.env.MONGODB_URL
        // , {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // }
        );
    console.log(`database connected : ${connect.connection.host}`)
    } catch (error) {
        console.log(error);
    }
    
}
module.exports = connectDB;
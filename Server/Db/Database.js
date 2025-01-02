const mongoose = require('mongoose')

const DatabaseConnect = ()=>{

    mongoose.connect(process.env.MONGO_URL).then((data)=>console.log(`MongoDb Connectd on${data.connection.host}`))
}

module.exports = DatabaseConnect

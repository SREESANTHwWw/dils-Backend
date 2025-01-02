const mongoose = require('mongoose')

const userAddreeSchema = new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"

    },

    fullname:{
        type:String
    },
    Pincode:{
        type:String
    },
    city:{
        type:String

    },
    phonenumber:{
        type:String

    },
    landmark:{
        type:String
    },
    state:{
        type:String
    }
})
module.exports = mongoose.model("Address",userAddreeSchema)
const mongoose = require("mongoose")

const orderSchema =  new mongoose.Schema({

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true

    },

   products:[{
    productname:{
        type:String
  
      },
      price:{
          type:String
  
      },
      minimum_order_quantity:{
          type:Number ,
          default:1
      },
     
    
   }],
   address:{
    type:Array
},
status: { type: String, default: "Pending" },

orderDate: { type: Date, default: Date.now },
subtotal:{
    type:Number
}

 
})
module.exports = mongoose.model("order" , orderSchema)

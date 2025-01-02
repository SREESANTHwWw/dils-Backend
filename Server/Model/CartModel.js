const mongoose = require('mongoose')

const CartModelSChema = new mongoose.Schema({
    userId :{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"User",

    },
   items:[{
    Product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    },
    productname:{
        type:String

    },
    product_img:{
       type:String
        
    },
    price:{
        type:String

    },
    medium_price:{
        type:String

    },
    premium_price:{
        type:String

    },
  
    description:{
        type:String
    },
    minimum_order_quantity:{
        type:Number ,
        // default:1
    },
    mRP:{
        type:Number
    },
   
  

   }] ,
   subtotal:{
    type:Number

}
  
})

module.exports = mongoose.model("cart" ,CartModelSChema)
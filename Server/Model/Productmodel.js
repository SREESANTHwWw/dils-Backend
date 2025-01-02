const mongoose = require('mongoose')



const ProductSchema = new mongoose.Schema ({

    productname:{
        type:String

    },
    product_img:{
       type:String
        
    },
    price:{
        type:Number

    },
    unitid:{
        type:String

    },

    description:{
        type:String

    },
    medium_price:{
        type:String

    },
    premium_price:{
        type:String

    },

    minimum_order_quantity:{
        type:String

    },

   

fast_moving:{
    type:String

},
isActive:{
    type:Boolean

},
mRP:{
    type:Number
},
// reorder_id:{
//     type:String

// },
// page :{
//     type:String
// },
// limit:{
//     type:String
// },
categoryProduct:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"category",
    default:null
},


// filename: { type: String,  },
// filepath: { type: String,  },
// fileUrl: { type: String,  },
// uploadedAt: { type: Date, default: Date.now },





    

    
    

})
;

module.exports = mongoose.model("Product" , ProductSchema)
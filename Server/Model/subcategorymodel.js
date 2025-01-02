const mongoose = require('mongoose')



const subCategoryModel = new mongoose.Schema({


    subCategory:{
        type:String
    },
    subCategory_img:{
        type:String
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId, // Referencing the ObjectId of Category
        ref: "category", // Reference to the Category model
       
      },
    


})
module.exports = mongoose.model('SubCategory', subCategoryModel);



const ErrorHandler = require('../Utils/ErrorHandler')
const CatchAsyncError =require( "../Middlewares/CatchAsyncError")
const CategoryModel = require("../Model/CategoryModel")
const express = require('express')
const router = express.Router()

router.get('/get-category',CatchAsyncError(async(req,res,next)=>{
    try {

        const getAllcategory = await CategoryModel.find()
        res.status(201).json({getAllcategory})
        
    } catch (error) {
        return next( new ErrorHandler(error.message,400))
        
    }
}) )

router.delete('/delete-cate/:id', CatchAsyncError(async(req,res,next)=>{

    try {
        const {id: category_id} =req.params
        console.log(category_id)

        const deleteCate = await CategoryModel.findOneAndDelete({_id: category_id})

        if(!deleteCate){
            res.status(401).json({msg :`No CateGory In${category_id} `})
        }
        res.status(201).json({msg:"category deleted successfully",deleteCate })

        
    } catch (error) {
        return next( new ErrorHandler(error.message,400))
    }
}))



module.exports = router
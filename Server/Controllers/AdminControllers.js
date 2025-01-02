const fs = require("fs");
const path = require("path");

const CatchAsyncError = require("../Middlewares/CatchAsyncError");
const Productmodel = require("../Model/Productmodel");
const ErrorHandler = require("../Utils/ErrorHandler");
const express = require("express");
const router = express.Router();
const { upload } = require("../Multer");
const CategoryModel = require("../Model/CategoryModel");
const subcategorymodel = require("../Model/subcategorymodel");

router.post(
  "/create-products",
  upload.single("product_img"),
  async (req, res, next) => {
    try {
      const {
        productname,
        price,
        unitid,
        description,
        medium_price,
        premium_price,
        minimum_order_quantity,
        fast_moving,
        isActive,
        categoryProduct,
        mRP
      } = req.body;


      // const fileData = new File({
      //   filename: req.file.originalname,
      //   filepath: req.file.path,
      //   fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
      // });

      // console.log(fileData);
      
      // await fileData.save();
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`
     const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
     
     
      const productdet = {
        productname,
        product_img: fileUrl,
        price,
        unitid,
        description,
        medium_price,
        premium_price,
        minimum_order_quantity,
        fast_moving,
        isActive,
        mRP,
        categoryProduct,
        
      };
      
      

      const products = await Productmodel.create(productdet);

      res.status(201).json({ msg: "success", products });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

router.delete(
  "/delete-product/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: Product_id } = req.params;
      console.log(req.params);
      console.log(Product_id);

      const deleteProduct = await Productmodel.findOneAndDelete({
        _id: Product_id,
      });
      if (!deleteProduct) {
        return res.status(400).json({ msg: `NO Product In ${Product_id}` });
      }
      res.status(200).json({ msg: "success" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.patch(
  "/edit-product/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: Product_id } = req.params;
      console.log(Product_id);
      console.log(req.params);

      const editProduct = await Productmodel.findOneAndUpdate(
        { _id: Product_id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!editProduct) {
        return res
          .status(400)
          .json({ mes: ` NO Product with this ${Product_id}` });
      }
      res.status(200).json({ msg: "Product Edited", editProduct });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.post(
  "/add-category",
  upload.single("Category_img"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const { parentCategory_id, Category_name, subCategory,hasSubcategory } = req.body;
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      const categorydet = {
        parentCategory_id,
        Category_img: fileUrl,
        Category_name,
        hasSubcategory,
        subCategory,
      };

      const category = await CategoryModel.create(categorydet);

      res.status(201).json({ msg: "success", category });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);


router.post('/add-subcategory/:id',upload.single("subCategory_img"),CatchAsyncError(async(req,res,next)=>{

  try {
        const {subCategory, category_id} =req.body
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`
        const subcategoryDet = {
          subCategory,category_id,subCategory_img:fileUrl
        }
      const add_category = await subcategorymodel.create(subcategoryDet)
      res.status(201).json({msg:"success" , add_category})

  } catch (error) {
    return next( new ErrorHandler(error.message,400))

  }
}))

router.get(
  "/get-category/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: category_id } = req.params;
      const getsub_category = await CategoryModel.find({
        subCategory: category_id,
      });
      console.log(getsub_category);
      res.status(201).json({ msg: "success", getsub_category });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.patch(
  "/edit-category/:id", upload.single("Category_img"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: category_id } = req.params;
      const { Category_id, Category_name, subCategory } = req.body;
      
      const filename = req.file.filename;
      const filePath = `uploads/${filename}`;
      const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
      const categorydet = {
        Category_id,
        Category_img: fileUrl,
        Category_name,
        subCategory,
      };

  
     

      const editcate = await CategoryModel.findOneAndUpdate(
        { _id: category_id },
        categorydet ,
        {
          runValidators: true,
          new: true,
        }
      );
      if (!editcate) {
        res.status(401).json({ msg: `NO  Category  with ${category_id}` });
      }
      res.status(201).json({ msg: "success", editcate });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

module.exports = router;

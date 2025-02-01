const fs = require("fs");
const path = require("path");

const CatchAsyncError = require("../Middlewares/CatchAsyncError");
const Productmodel = require("../Model/Productmodel");
const ErrorHandler = require("../Utils/ErrorHandler");
const express = require("express");
const router = express.Router();
const upload = require("../Multer");
const CategoryModel = require("../Model/CategoryModel");
const subcategorymodel = require("../Model/subcategorymodel");
const Server = require("../Server");
const UnitModal = require("../Model/UnitModal");
const cloudinary = require("cloudinary").v2;
const admin = require("firebase-admin");



const ServiceAccount = require("../Firebase/dils-trades-push-firebase-adminsdk-fbsvc-d9ed9896bd.json");
const Usermodel = require("../Model/Usermodel");
const FcmTokenmodel = require("../Model/FcmTokenmodel");
admin.initializeApp({
  credential:admin.credential.cert(ServiceAccount)
})


router.post(`/send-notification`, CatchAsyncError(async(req,res,next)=>{
  try {
    const {title,body,token} =req.body
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: token,
    };
    admin.messaging().send(message)
    .then((Response)=>{
      console.log("Notification sent successfully",Response)
      res.status(200).json({msg:"Notification sent successfully"})
    }).catch((err)=>{
      console.error('Error sending notification:', err);
      res.status(500).json({ error: 'Failed to send notification' });
    })
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}))

router.post("/save-fcm-token", async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ error: "User ID and Token are required" });
    }

    const existingToken = await FcmTokenmodel.findOne({ userId });

    if (existingToken) {
      if (existingToken.token !== token) {
        existingToken.token = token;
        await existingToken.save();
        return res.status(200).json({ message: "FCM Token updated successfully" });
      }
      return res.status(200).json({ message: "FCM Token is already up-to-date" });
    } else {
      await FcmTokenmodel.create({ userId, token });
      return res.status(201).json({ message: "FCM Token saved successfully" });
    }
  } catch (error) {
    console.error("Error saving FCM Token:", error);
    return res.status(500).json({ error: "Failed to save FCM Token" });
  }
});

router.get(`/getToken/:userId`,CatchAsyncError(async(req,res,next)=>{
  try {
    const {userId} = req.params
    const token = await FcmTokenmodel.findOne({userId})
    if(!token){
      return res.status(404).json({error:"Token not found"})
    } 
    res.status(200).json({token})
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
    
  }
}))


router.post("/remove-fcm-token",CatchAsyncError( async (req, res) => {
  try {
    const { userId, token } = req.body;

    await FcmTokenmodel.findOneAndDelete({ userId, token });
    res.json({ message: "FCM Token removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove FCM Token" });
  }
}));



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
        mRP,
      } = req.body;

      // const fileData = new File({
      //   filename: req.file.originalname,
      //   filepath: req.file.path,
      //   fileUrl: http://localhost:5000/uploads/${req.file.filename},
      // });

      // console.log(fileData);

      // await fileData.save();
      const result = await cloudinary.uploader.upload(req.file.path);
      const fileUrl = result.secure_url;
      

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

router.post(
  `/addunit`,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { unitname } = req.body;

      // Ensure the unitname is provided
      if (!unitname) {
        return next(new ErrorHandler("Unit name is required", 400));
      }

      // Create a new unit
      const unitCreate = await UnitModal.create({ unitname });

      res.status(201).json({ msg: "success", unitCreate });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);
router.get(`/getunit`,CatchAsyncError(async(req,res,next)=>{
  try {
    
    const getUnit = await UnitModal.find({})
    res.status(201).json({ msg: "success", getUnit });


  } catch (error) {
    
    return next(new ErrorHandler(error.message, 400));
  }
}))
router.delete(`/deleteUnit/:id`,CatchAsyncError(async(req,res,next)=>{
  try {
    const {id:unitid} =req.params

    const deleteUnit = await UnitModal.findOneAndDelete({_id:unitid})
     res.status(200).json({msg:"success"})
    
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}))
router.patch(`/editUnit/:id`, CatchAsyncError(async (req, res, next) => {
  try {
    const { id: unitid } = req.params; // Extract unit ID from params
    const { unitname } = req.body; // Extract updated unit name from request body

    if (!unitname) {
      return res.status(400).json({ msg: "Unit name is required" });
    }

    const updatedUnit = await UnitModal.findByIdAndUpdate(
      unitid, 
      { unitname }, 
      { new: true, runValidators: true } // Returns the updated document
    );

    if (!updatedUnit) {
      return res.status(404).json({ msg: "Unit not found" });
    }

    res.status(200).json({ msg: "Unit updated successfully", updatedUnit });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}));


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
  "/edit-product/:id",upload.single("product_img"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const {id : Product_id } = req.params;
      const {
        productname,
        product_img,
        price,
        unitid,
        description,
        medium_price,
        premium_price,
        minimum_order_quantity,
        fast_moving,
        mRP,
      } = req.body;

      const productExist = await Productmodel.findById(Product_id );
      if (!productExist) {
        res.status(401).json({ msg: "Product Not Found" });
      }

      const updateProduct = {};
      if (productname) updateProduct.productname = productname;
    
      if (price) updateProduct.price = price;
      if (unitid) updateProduct.unitid = unitid;
      if (description) updateProduct.description = description;
      if (medium_price) updateProduct.medium_price = medium_price;
      if (premium_price) updateProduct.premium_price = premium_price;
      if (minimum_order_quantity) updateProduct.minimum_order_quantity = minimum_order_quantity;
      if (fast_moving) updateProduct.fast_moving = fast_moving;
      if (mRP) updateProduct.mRP = mRP;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        const fileUrl = result.secure_url;
        updateProduct.product_img = fileUrl;
      }


      const editProduct = await Productmodel.findByIdAndUpdate(
         Product_id ,
         { $set: updateProduct },
        
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
      res.status(200).json({ msg: "success", editProduct });
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
      const { parentCategory_id, Category_name, subCategory, hasSubcategory } =
        req.body;
        const result = await cloudinary.uploader.upload(req.file.path);
        const fileUrl = result.secure_url;
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

router.post(
  "/add-subcategory/:id",
  upload.single("subCategory_img"),
  CatchAsyncError(async (req, res, next) => {
    try {
      const { subCategory, category_id } = req.body;
      const result = await cloudinary.uploader.upload(req.file.path);
      const fileUrl = result.secure_url;
      const subcategoryDet = {
        subCategory,
        category_id,
        subCategory_img: fileUrl,
      };
      const add_category = await subcategorymodel.create(subcategoryDet);
      res.status(201).json({ msg: "success", add_category });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

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
  "/edit-category/:id",
  upload.single("Category_img"), // Middleware for single image upload
  CatchAsyncError(async (req, res, next) => {
    try {
      // Extract category ID from params
      const { id: category_id } = req.params;

      // Fetch fields from request body
      const { Category_name, hasSubcategory } = req.body;

      // Find the existing category
      const existingCategory = await CategoryModel.findById(category_id);
      if (!existingCategory) {
        return res
          .status(404)
          .json({ msg: `No category found with ID ${category_id}` });
      }

      // Prepare updated data object
      const updatedData = {};

      // Update category name if provided
      if (Category_name) updatedData.Category_name = Category_name;

      // Update hasSubcategory if provided
      if (hasSubcategory !== undefined) {
        updatedData.hasSubcategory = hasSubcategory;
      }

      // Update image if a new file is uploaded
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        const fileUrl = result.secure_url;
        updatedData.Category_img = fileUrl;
      }

      // Perform the update operation
      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        category_id,
        { $set: updatedData }, // Update only specified fields
        { runValidators: true, new: true } // Return updated document
      );

      // Response
      res.status(200).json({ msg: "success", updatedCategory });
    } catch (error) {
      console.error("Error updating category:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  })
);






module.exports = router;

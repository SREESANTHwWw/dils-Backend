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

const UnitModal = require("../Model/UnitModal");
const cloudinary = require("cloudinary").v2;
const admin = require("firebase-admin");


const ServiceAccount = {
  "type": "service_account",
  "project_id": "dils-trades-push",
  "private_key_id": "04fd9ad2547bfbf3a925e430d2634b26b003bbb5",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDjRlOu4n6xHMmx\ny/Ia5exohQWzq0DjnfwXoqSqxpCsUNyTBDgg6pWLlbNa9PmEeHscFOOodmLbBaRl\n/gSZTEO5/4h/a3VX40L+dHhrjeRGFlCkW22XY9RX/2UmyIUa6c93O5h2CiCqjl3K\nSsbtHGqQQhbwiclsOoO/4BAOKe1WaBUez3KyoAJCpAzFQn06oWKchmWeCXAtpYjo\nn1gHQLnn/NDOFiEGKymTvJQsD+qz2IxO7OcJMCccpTF7cdWLwYJjhIa7QjzRY1Fa\n/0WIuuNLkEvP8SCMpx4/ZpqAIOpGB8KaW5oGQoQBBHUeQ6nwqtsxJUcj/S3r9NQz\nDa0OoFOnAgMBAAECggEAA8nl1jn/W6t7r0OTlyAzFzD0feDCdajqDWjQLuqdecnl\nS2wcFWxjrs6BjWgdCrjJcJfmjaXfkwAek/auk/GiBWU9nMYpUBxBPyWo5j4YypRP\nptXBV286GHdw87sPAPpZ04aCTaFwlvdFl/w0IbrCCgKYCE17tpqpHJc7HUlUpAaT\nGXtSw4spaRIvIncPVWMdLqSemxpa5v3GmvnzBWllx3pdC4YB3Vb5uq2DHyviFkJK\nL9SA+oDo4SsRBeUkAlUzx1CJcAFBhhP1NnkLdTr1rqxYpkfqLO05J/k5ZEsqzww4\n4kYAI+TfNdwFiLlTsiOwcGVXykjTEYYtdqCsW+F/BQKBgQD/SC8WxwfiflyeSv4Y\n7FxthrmAskNhaQi+j/ReE89BMN5SioKh2c5e5Cnjs7KDGhirqo5JmgjOhvApYsI6\nuT+QPsjWDFvhA/1whtwGpgVJIcXscGjSVSEGgIXWuiFFxgYFsvkvQKWhEz7HnnRT\nUhjT5W9Ni+o/A1JEU0we/8EnywKBgQDj6fnuSZNyx8WRPWoMVEHHGOSesEOnlXiu\nhQ9EnbMJrKiBVjFXQbk3fmzkkH/KN9SgwquEthAs3WxYmJbJ7YXJP/VGaDSdzcD2\nZx3BVxIuV7YlHRYVFCoZzvUQvriAPxdt0fiFvnaMwpoeROjmCL8eH1t7YVUMHh7f\n0xIMdrYwFQKBgE81p57KrPCjQru/Cy7SkC9P4VlEdtHP1G3Enw9d2C4jKqiz36q2\nuWkKJNFJXbd+Lm99oV7HE7p5diVxRlEQT9/DC3AXL58XLNlwju7lLritaQtfKbcx\nwOiSknS5Fj/fHNlB2j3GMl5TaWRpDzEXRSrigvGt20YoEquuqOzpcJaXAoGBAOAE\n3i3y0eRzKeV9qRwfQVxSQn0cIhO53pojnYNDQnTS6fne37a1mjlKofvzcDgysmOl\nlPNoBPQkXFek/CnUtri+jfa7fGRTlkRbzKp6TBuTCSznrwne/RbLDqR74lvkJ8JB\nLXdAY8Qtj1ELSKS6miggiEn4vKChhpVYIRhxItiVAoGAQFWhgMwLfbFI46o9PbR7\nE9Km0NPUaC0K9k3vcG8nXLlhUtxYm+lqvwG5kMX3vv32ZlPr/bIvJVaoPGV1wZSN\nvhanB7GjEIyJk/cXAdn7KlxyapdMHSmyru97kn6WU/GSgGx1m/n3NxkxV8of3EQd\nKS8w4RWMylXdfZsV/6OENec=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@dils-trades-push.iam.gserviceaccount.com",
  "client_id": "100503793453840952095",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40dils-trades-push.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}



// const ServiceAccount = require(process.env.FIREBASE_CREDENTIALS);
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
      res.status(200).json({msg:"sent successfully"})
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

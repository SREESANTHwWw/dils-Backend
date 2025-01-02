const Productmodel = require("../Model/Productmodel");
const express = require("express");
const router = express.Router();
const ErrorHandler = require("../Utils/ErrorHandler");
const CatchAsyncErr = require("../Middlewares/CatchAsyncError");
const products = require("../Controllers/AdminControllers");
const CatchAsyncError = require("../Middlewares/CatchAsyncError");
const CartModel = require("../Model/CartModel");
const { default: mongoose, skipMiddlewareFunction } = require("mongoose");
const OrderModel = require("../Model/OrderModel");
const Usermodel = require("../Model/Usermodel");

router.get(
  "/get-products",
  CatchAsyncError(async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      // Fetch the total number of products to calculate pagination
      const totalProducts = await Productmodel.countDocuments();

      // Fetch paginated products
      const results = await Productmodel.find().limit(limit).skip(skip);

      // Calculate total number of pages
      const totalPages = Math.ceil(totalProducts / limit);

      // Send response with products and pagination info
      res.status(200).json({
        results,
        totalProducts,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      next(new ErrorHandler("Product is Not Found", 404)); // Properly handle the error
    }
  })
);

router.get('/get-all-products', CatchAsyncError(async (req, res, next) => { 

  try {
    page = Number(req.query.page) || 1;
    limit = Number(req.query.limit) || 8;
    skip = (page - 1) * limit;

    totalProducts = await Productmodel.countDocuments();
    results = await Productmodel.find().limit(limit).skip(skip);

    totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      results,
      totalProducts,
      totalPages,
      currentPage: page,
    });

    
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}));
router.get('/get-full-products', CatchAsyncError(async (req, res, next) => { 

  try {


  
   const  results = await Productmodel.find({})
   if(!results){
    return res.status(401).json({msg:"No products found"})
   }

    

    res.status(200).json({
      results,
      
    });

    
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}));


router.get(
  "/get-products/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: Product_id } = req.params;

      const GetcategoryProuduct = await Productmodel.find({
        categoryProduct: Product_id,
      });
      res.status(201).json({ msg: "success", GetcategoryProuduct });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get('/getOneproduct/:Id', CatchAsyncError(async (req, res, next) => {
  try {
    const { Id } = req.params;

    const getOneproduct= await Productmodel.find({ _id:Id });
    if (getOneproduct.length === 0) {
      return res.status(401).json({ msg: "No user address found for this ID" });
    }
    res.status(200).json(getOneproduct); // Return the array directly
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
}));

router.get("/file/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id); //pass file id means _id

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.status(200).json({
      filename: file.filename,
      fileUrl: file.fileUrl,
      uploadedAt: file.uploadedAt,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving file", error: err.message });
  }
});
router.post(
  "/addToCart",
  CatchAsyncError(async (req, res, next) => {
    try {
      const {
        userId,
        Product_id,
        minimum_order_quantity = 1,
        productname,
        product_img,
        description,
        mRP,
        action,
      } = req.body;

      // Retrieve user data to determine userType
      const user = await Usermodel.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User Not Found" });
      }

      const userType = user.type; // Assuming 'type' field holds 'user', 'medium', or 'premium'

      // Check if the product exists in the database
      const Product = await Productmodel.findById(Product_id);
      if (!Product) {
        return res.status(404).json({ msg: "Product Not Found" });
      }

      // Dynamically select price based on userType
      let selectedPrice;
      if (userType === "medium") {
        selectedPrice = Product.medium_price || Product.price;
      } else if (userType === "premium") {
        selectedPrice = Product.premium_price || Product.price;
      } else {
        selectedPrice = Product.price; // Default price for normal users
      }

      // Find the user's cart
      let cart = await CartModel.findOne({ userId });

      // If cart doesn't exist, create a new cart
      if (!cart) {
        cart = new CartModel({
          userId,
          items: [
            {
              Product_id,
              minimum_order_quantity,
              productname,
              product_img,
              description,
              price: selectedPrice,
              mRP,
              subtotal: selectedPrice * minimum_order_quantity,
            },
          ],
        });
      } else {
        // Check if the product is already in the cart
        const productIndex = cart.items.findIndex(
          (item) => item.Product_id.toString() === Product_id
        );

        if (productIndex !== -1) {
          // If product exists, handle quantity increment or decrement
          if (action === "increase") {
            cart.items[productIndex].minimum_order_quantity += 1;
          } else if (action === "decrease") {
            if (cart.items[productIndex].minimum_order_quantity > 1) {
              cart.items[productIndex].minimum_order_quantity -= 1;
            } else {
              // Remove the product if quantity goes below 1
              cart.items.splice(productIndex, 1);
            }
          }

          // Update subtotal for the existing product
          cart.items[productIndex].subtotal =
            cart.items[productIndex].minimum_order_quantity *
            cart.items[productIndex].price;
        } else {
          // Add new product to the cart
          cart.items.push({
            Product_id,
            minimum_order_quantity,
            productname,
            product_img,
            description,
            price: selectedPrice,
            mRP,
            subtotal: selectedPrice * minimum_order_quantity,
          });
        }
      }

      // Recalculate the total subtotal for all items in the cart
      const newSubtotal = cart.items.reduce(
        (total, item) => total + item.price * item.minimum_order_quantity,
        0
      );
      cart.subtotal = newSubtotal;

      // Save the updated cart
      await cart.save();
      return res.status(201).json({ cart });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);


router.get(
  "/getAll-cart/:userId",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ msg: "Invalid userId format" });
      }

      const getCart = await CartModel.findOne({ userId });

      if (!getCart) {
        return res.status(404).json({ msg: "Cart not found for this user" });
      }

      res.status(200).json({ msg: "Success", cart: getCart });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);



router.delete(
  "/removeFromCart/:userId/:Product_id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { userId, Product_id } = req.params;

      // Find the user's cart
      const cart = await CartModel.findOne({ userId });

      if (!cart) {
        return res.status(404).json({ msg: "Cart not found" });
      }

      // Filter out the product to be removed
      const initialLength = cart.items.length;
      cart.items = cart.items.filter(
        (item) => item.Product_id.toString() !== Product_id
      );

      // Check if any product was actually removed
      if (cart.items.length === initialLength) {
        return res.status(404).json({ msg: "Product not found in cart" });
      }

      // Recalculate the subtotal
      const newSubtotal = cart.items.reduce(
        (total, item) => total + item.price * item.minimum_order_quantity,
        0
      );
      cart.subtotal = newSubtotal;

      // Save the updated cart
      await cart.save();

      return res.status(200).json({
        msg: "Product removed from cart",
        cart, // Updated cart with recalculated subtotal
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);


router.post(
  "/create-order",
  CatchAsyncError(async (req, res, next) => {
    try {
      const {
        userId,
        orderDetails,
        address,
       subtotal
      } = req.body;

  

      const Neworder = new OrderModel({
        userId:userId,
        products:orderDetails,
        address:address,
        subtotal:subtotal
      });

      Neworder.save()

      res.status(201).json({ Neworder });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);
router.get('/getorder/:userId',CatchAsyncError(async(req,res,next)=>{
  try {
    const {userId } = req.params

    const getorders = await OrderModel.find({userId}) 
    if(!getorders){
      res.status(401).json({msg:`NO orders in this User`})
    }
    res.status(200).json({getorders})
    
  } catch (error) {
    return next( new ErrorHandler(error.message,400))
    
  }
}))
router.get('/getAllorders',CatchAsyncError(async(req,res,next)=>{
  try {
  
    page =Number(req.query.page)||1;
    limit = Number(req.query.limit)||4;
    skip = (page - 1) * limit;
    totalorders = await OrderModel.countDocuments();
    totalPages = Math.ceil(totalorders / limit);

    const getorders = await OrderModel.find({}).limit(limit).skip(skip).sort({orderDate:-1})
    if(!getorders){
      res.status(401).json({msg:`NO orders in this User`})
    }
    res.status(200).json({getorders,totalorders,totalPages,currentPage:page})
    
  } catch (error) {
    return next( new ErrorHandler(error.message,400))
    
  }
}))
router.patch('/updateOrders/:orderId', CatchAsyncError(async (req, res, next) => {
  try {
    const { orderId } = req.params; // Extract orderId from params

    // Find and update the order
    const updatedOrder = await OrderModel.findByIdAndUpdate(
      orderId, // Use _id to identify the order
      req.body, // Fields to update
      {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({ msg: `No order found with ID: ${orderId}` });
    }

    // Respond with the updated order
    res.status(200).json({
      success: true,
      msg: 'Order updated successfully',
      updatedOrder,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 400)); // Use centralized error handler
  }
}));




module.exports = router;

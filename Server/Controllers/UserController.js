const usermodel = require("../Model/Usermodel");
const express = require("express");
const ErrorHandler = require("../Utils/ErrorHandler");
const jwt = require("jsonwebtoken");
const router = express.Router();
const CatchAsyncError = require("../Middlewares/CatchAsyncError");
const sendToken = require("../Utils/JwtTokwn");
const CartModel = require("../Model/CartModel");
const UserAddressmode = require("../Model/UserAddressmode");
const { upload } = require("../Multer");

const cloudinary = require("cloudinary").v2;

router.post(
  "/registration",
  upload.single("shopPhoto"),
  CatchAsyncError(async (req, res) => {
    try {
      const {
        username,
        password,
        shopname,
        owner,
        phonenumber,
        address,
        gstno,
        pincode,
        city,
        whatsappno,
        stateid,
        type,
        createdAt,
        shopPhoto,
      } = req.body;
      const productFilename = req.file.filename;
      const filepath = `uploads/${productFilename}`;
      const fileUrl = `http://localhost:5000/uploads/${productFilename}`;

      const userdet = {
        username,
        password,
        shopname,
        owner,
        phonenumber,
        address,
        gstno,
        pincode,
        city,
        whatsappno,
        stateid,
        type,
        createdAt,
        shopPhoto: fileUrl,
      };

      const existUsername = await usermodel.findOne({ username });
      if (existUsername) {
        return res.status(400).json({ msg: "UserName Already Exist" });
      }
      const user = await usermodel.create(userdet);

      res.status(201).json({ msg: "success", user });
    } catch (error) {
      res.status(500).json({ error });
    }
  })
);

router.post(
  "/login-user",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return next(new ErrorHandler("please Provide All inputs"));
      }
      const user = await usermodel.findOne({ username }).select("+password");
      console.log(user);

      if (!user) {
        return next(new ErrorHandler("Request User not Found", 400));
      }
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("invaild Credentials"), 400);
      }
      if (user.type === "admin") {
        // Send token and user data for admin login
        sendToken(user, 200, res);
      } else {
        // Send token and user data for normal user login
        sendToken(user, 200, res);
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/get-users",
  CatchAsyncError(async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 4;
      const skip = (page - 1) * limit;

      // Fetch the total number of products to calculate pagination
      const totalusesr = await usermodel.countDocuments();

      // Fetch paginated products
      const getusers = await usermodel
        .find({ type: { $ne: "admin" } })
        .limit(limit)
        .skip(skip);

      // Calculate total number of pages
      const totalPages = Math.ceil(totalusesr / limit);

      res.status(201).json({ getusers, totalPages, currentPage: page });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);
router.get(
  "/get-all-users",
  CatchAsyncError(async (req, res, next) => {
    try {
      
     const getusers = await usermodel.find({ type: { $ne: "admin" } });
      
    

      res.status(201).json({ getusers});
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.delete( 
  "/delete-user/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: User_id } = req.params;
      const deleteuser = await usermodel.findOneAndDelete({ _id: User_id });
      if (!deleteuser) {
        res.status(401).json({ msg: `No User in ${User_id}` });
      }
      res.status(200).json({ msg: "success" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.patch(
  `/edit-user/:id`,
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: User_id } = req.params;
      const edituser = await usermodel.findOneAndUpdate(
        { _id: User_id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!edituser) {
        return res.status(401).json({ msg: `No User with ${User_id}` });
      }
      return res.status(200).json({ edituser });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.post(
  "/add-address",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { userId, fullname, Pincode, city, phonenumber, landmark, state } =
        req.body;

      const newAddress = new UserAddressmode({
        userId: userId,
        fullname: fullname,
        Pincode: Pincode,
        city: city,
        phonenumber: phonenumber,
        landmark: landmark,
        state: state,
      });
      newAddress.save();
      res.status(201).json({ newAddress });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/getAddress/:userId",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { userId } = req.params;

      const getaddress = await UserAddressmode.find({ userId });
      if (getaddress.length === 0) {
        return res
          .status(401)
          .json({ msg: "No user address found for this ID" });
      }
      res.status(200).json(getaddress); // Return the array directly
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

// Delete address route using `findOneAndDelete`
router.delete(
  "/delete-address/:userId/:addressId",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { userId, addressId } = req.params;

      // Find and delete the address directly from the Address collection
      const deletedAddress = await UserAddressmode.findOneAndDelete({
        _id: addressId,
        userId: userId, // Ensure the address belongs to the correct user
      });

      if (!deletedAddress) {
        return res.status(404).json({
          msg: `Address not found with ID ${addressId} for User ${userId}`,
        });
      }

      // Address successfully deleted
      res.status(200).json({ msg: "Address deleted successfully" });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);
router.patch(
  "/editAddress/:id",
  CatchAsyncError(async (req, res, next) => {
    try {
      const { id: userId } = req.params;

      const editedAddress = await UserAddressmode.findOneAndUpdate(
        {
          _id: userId,
        },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      )
      if(!editedAddress){
        res.status(401).json({msg:"Address not Found"})
      }
      res.status(201).json({editedAddress})
    } catch (error) {
      return next(new ErrorHandler(error.message), 400);
    }
  })
);

module.exports = router;

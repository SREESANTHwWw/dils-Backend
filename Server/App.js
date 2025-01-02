const express = require("express");
const DatabaseConnect = require("./Db/Database");
const app = express();
const path = require('path')
const userrouter = require("./Controllers/UserController");
const adminrouter = require("./Controllers/AdminControllers");
const Productrouter = require("./Controllers/ProductsController")
const categoryrouter = require("./Controllers/CategoryController")
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

app.get("/", (req, res) => {
  res.send("home");
});
app.use(express.json());
app.use(cookieParser())

app.use(cors());
app.use("/api/v1", userrouter);
app.use("/api/v1/", adminrouter);
app.use("/api/v1/",Productrouter)
app.use('/api/v1/', categoryrouter) 
app.use("/uploads", express.static(path.join(__dirname, "uploads")))


const start = async () => {  
  try {
    await DatabaseConnect();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running ${process.env.PORT} `);
    });
  } catch (error) {
    console.log(error);
  }
};
start();

module.exports = app;

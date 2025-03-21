const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({

 username:{
    type:String,
    required:[true ,'Must Provide a Name'],
    trim:true,
    maxlength:[20 ,'More than 20 character']
  },
  password:{
    type:String,
    required:[true ,"Must Provide A Password"],
    minlength:[8 , "less than 8 character"],
    Select:false

  },
  shopname:{
    type:String,
    required:[true, "Must Provide a  shopname"],
   
  },
  shopPhoto:{
  type:String
  },
  owner:{
    type:String,
    required:[true, "Must Provide a ownername"],
  
  },
  phonenumber:{
    type:String,
    required:[true, "Must Provide a phonenumber"],
   
  },
  address:{
    type:String,
    required:[true, "Must Provide a phonenumber"],
   
  },
  gstno:{
    type:String,
   
    

  },
  pincode:{
    type:String,
    required:[true, "Must Provide a phonenumber"],
   
  },
  city:{
    type:String,
    required:[true, "Must Provide a cityname"],
    
  },
  whatsappno:{
    type:String,
    required:[true, "Must Provide  a phonenumber"],
    
  },

  stateid:{
    type:String,
    required:[true, "Must Provide  a stateid"],
   
  },

  type:{
    type:String,
    enum: ["User", "admin","Medium","Premium"],
    default:"User",
   
  },
  createdAt:{
    type:Date,
    default: Date.now()
},
fcmToken: 
{ type: String, default: null } 


})


UserSchema.methods.getJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      shopname: this.shopname,
      owner: this.owner,
      phonenumber: this.phonenumber,
      address: this.address,
      gstno: this.gstno,
      pincode: this.pincode,
      city: this.city,
      whatsappno: this.whatsappno,
      stateid: this.stateid,
      type: this.type
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES }
  );
};

 
UserSchema.pre("save", async function(next){
  if(!this.isModified("password")){
    next()
    
  }
  this.password = await bcrypt.hash(this.password, 10)
} )


UserSchema.methods.comparePassword= async function (enterpassword) {
    return await  bcrypt.compare(enterpassword, this.password )
}
module.exports = mongoose.model("User",UserSchema)
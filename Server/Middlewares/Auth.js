const jwt = require('jsonwebtoken')
const CatchAsyncError = require('./CatchAsyncError')
const ErrorHandler = require('../Utils/ErrorHandler')
const Usermodel = require('../Model/Usermodel')

exports.isAuthenticated = CatchAsyncError(async(req,res,next)=>{
    const {token} = req.cookies

    if(!token){
        return next( new ErrorHandler("please Login ",401))

    }
    const decode =jwt.verify(token ,process.env.JWT_SECRET_KEY);
    req.user = Usermodel.findById(decode.id)
    next()
})
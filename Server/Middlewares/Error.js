const ErrorHandler = require('../Utils/ErrorHandler')

module.exports = (err, req , res , next)=>{
    err.statusCode  = err.statusCode || 500,
    err.message =  err.message || "Internal Server Error";
}
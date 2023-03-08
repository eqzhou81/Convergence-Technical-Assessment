const userModel = require('./models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Check if user is logged into correct account to update/delete their tasks
const isAuthenticated = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        if(!token){
            return next('Please login to access the data');
        }
        const verify = jwt.verify(token, process.env.SECRET_KEY);
        user = await userModel.findById(verify.user);
        req.user = user;
        next();
    } catch (error) {
       return next(error); 
    }
}

module.exports = isAuthenticated;
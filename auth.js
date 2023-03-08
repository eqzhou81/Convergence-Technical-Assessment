const userModel = require('./models/userModel');
const jwt = require('jsonwebtoken');

// Check if user is logged into correct account to update/delete their tasks
const isAuthenticated = async (req,res,next)=>{
    try {
        const token = req.cookies.token;
        if(!token){
            return next('Please login to access the data');
        }
        const verify = jwt.verify(token, "123456789");
        req.user = await userModel.findById(verify.user);
        req.token = token;
        next();
    } catch (error) {
       return next(error); 
    }
}

module.exports = isAuthenticated;
//Requiring all the necessary files and libraries
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Creating express router
const route = express.Router();
const userModel = require('../models/userModel');
const taskModel = require('../models/taskModel');

// Register user
route.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username | !password) {
            return res.json("Please enter all information");
        }

        if (await userModel.findOne({username: username})) {
            return res.json("Username already taken");
        }

        // Salt and hash password before storing in db
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashPassword;
        const user = new userModel(req.body);
        await user.save();

        const token = jwt.sign({ user }, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });
        return res.cookie("token", token).json({ success: true, message: 'User successfully registered', data: user });

    } catch (error) {
        return res.json({ error: error });
    }
});

// Login user
route.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        //Check emptyness of the incoming data
        if (!username || !password) {
            return res.json({ message: 'Please enter all the details' })
        }
        //Check if the user already exist or not
        const userExist = await userModel.findOne({username: req.body.username});
        if (!userExist) {
            return res.json({message: 'User does not exist'})
        }
        //Check if password matches
        const isPasswordMatched = await bcrypt.compare(password, userExist.password);
        if(!isPasswordMatched){
            return res.json({message: 'Wrong credentials pass'});
        }
        const token = jwt.sign({ userExist }, process.env.SECRET_KEY , {
            expiresIn: '1h',
        });
        
        return res.cookie("token", token).json({success: true,message: 'Logged In Successfully'});
    } catch (error) {
        return res.json({ error: error });
    }
});



module.exports = route;
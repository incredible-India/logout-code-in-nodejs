require('dotenv').config()
const user =require('./../models/user')
// const cookieParser =require('cookie-parser')
const jwt = require("jsonwebtoken")

async function auth(req,res,next){

try {
    const token = req.cookies.jwt
    const varify =jwt.verify(token,process.env.SECRET_KEY)

    let users =await user.findOne({_id:varify._id})

    req.users =users
    next();
} catch (error) {
  
    res.redirect('/login')
}

}

module.exports =auth
require('dotenv').config()
const mongoose = require('mongoose');
const bcryptjs =require('bcryptjs')
const jwt = require("jsonwebtoken")

var schema = mongoose.Schema;

var newusers = new schema(
    {
        name: {
            type: String,
            required: true
        
        }
        ,

        password: {
            type: String,
            required: true
        },

        cnfpassword: {
            type: String,
            required: true
        },

        email: {
            type: String,
            unique: true,
            required: true
        }
        ,
         img: {
            data: Buffer,
            contentType: String
        },

        imgpath:{
            type:String
        },
        tokens: [
            {
                token:
                {
                    type: String,
                    required: true
                }
            }
        ]
    }
)


newusers.methods.gentoken = function (){

    const token =jwt.sign({_id:this._id},process.env.SECRET_KEY)
    this.tokens =this.tokens.concat({token:token})
    this.save();
    return token

}

newusers.pre('save',function (next){
    if(this.isModified('password'))
    {
        this.password =bcryptjs.hashSync(this.password,10)
    }
    next()
})

myuser =mongoose.model("newuser",newusers)


module.exports =myuser
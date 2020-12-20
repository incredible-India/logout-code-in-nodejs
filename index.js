require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const pug = require('pug')
const bcryptjs = require('bcryptjs')
const path = require("path")
const myuser = require('./models/user')
const fs = require('fs')
const multer = require('multer')
const auth = require('./middleware/auth')


// connection for the database 
mongoose.connect("mongodb://127.0.0.1:27017/logout", {
    useNewUrlParser: true,

    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true

}, (error, data) => {
    if (error) {
        console.log("Database connection error")

    } else {
        console.log("Database connection successfully");
    }
})
////////////////////////////////////////////////////

const app = express();
app.use(express.urlencoded({ extended: true }))//parsing the url data
app.set("view engine", "pug")
app.set("views", './public/')
app.use(cookieParser())//parsing the cookies from the database......
app.use(express.static(path.join(__dirname + '/')))

const port = process.env.PORT || 80

//for the image using multer

var storage = multer.diskStorage({
    destination: 'userimage'


    , filename: (req, file, cb) => {
        cb(null, Date.now() + "_user_" + file.originalname)
    }
})

var uploads = multer({ storage: storage })



app.get('/', (req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.sendFile(path.join(__dirname, "./public/", "index.html"))

})



app.get('/newuser', (req, res) => {

    res.render('index', {
        title: "New Users",
        value: true,
        currentlink: "Profile",
        link: "newuser"
    })

})



app.get('/login', (req, res) => {

    res.render('index', {
        title: "Log In",
        value: false,
        currentlink: "New User",
        link: "newuser"
    })

})


app.post('/profile', uploads.single('avtar'), (req, res, next) => {

    // console.log(req.file);
    // console.log(fs.readFileSync(path.join(__dirname + '\\' + req.file.path)));
    if (req.body.password === req.body.cnfpassword) {
        let saveusers = new myuser({
            name: req.body.name,
            password: req.body.password,
            cnfpassword: req.body.cnfpassword,
            email: req.body.email,
            imgpath: req.file.path,
            img: {
                data: fs.readFileSync(path.join(__dirname + '\\userimage\\', req.file.filename)),
                contentType: 'image/jpg'
            }



        })
        // console.log(saveusers.img.contentType);

        const token = saveusers.gentoken();
        // console.log('token is ', token);
        res.cookie('jwt', token)

        // saveusers.save()

        // res.json(saveusers)


        res.redirect('/login')


    } else {
        return res.send("<h1> Password mismatched</h1>")
    }


})


// for the login system 

app.post('/okdone', async (req, res) => {

    let login = await myuser.findOne({ email: req.body.email })

    if (login == null) {
        return res.send('incoorect id or password please try again')
    }

    const token = login.gentoken()

    if (await bcryptjs.compareSync(req.body.password, login.password)) {
        res.cookie('jwt', token)
        return res.send("welcome")
    } else {
        return res.send('incoorect id or password please try again')
    }




})


app.get('/showdata', auth, async (req, res, next) => {

    res.send("aha")

})

app.get('/logout',auth, (req,res,next)=>{

    req.users.tokens =[];
    res.clearCookie('jwt')
    req.users.save();
    res.redirect('/')


})

app.listen(port, () => {

    console.log(process.env.MSG, port);
})

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bcrypt = require('bcryptjs');
const Register = require("./models/register");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: "my secret key",
        saveUninitialized: true,
        resave: false
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use(express.static("uploads"));

//DB Connection
mongoose.connect("mongodb://localhost:27017/node_crud", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connection Successfull");
}).catch((err) => {
    console.log(err);
});


//Template Engine
app.set("view engine", "ejs");

//Routes
app.use("", require("./routes/routes"));


//Register user
app.get('/register', (req, res) => {
    res.render("register");
});

app.post('/register', async (req, res) => {

    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                phone: req.body.phone,
                password: password,
                cpassword: cpassword,
                gender: req.body.gender
            });

            let register = await registerEmployee.save();
            res.render("login", {
                title: "Registration",
                message: "Registration Succesfull"
            });
        }
        else {
            res.send("Passwords are not matching")
        }

    } catch (error) {
        res.status(400).send(error);
    }
});

//Login user
app.get('/login', (req, res) => {
    res.render("login");
});

app.post('/login', async (req, res) => {

    try {
        const loginemail = req.body.email;
        const loginpassword = req.body.password;

        const useremail = await Register.findOne({ email: loginemail });

        if (useremail) {
            const isMatch = await bcrypt.compare(loginpassword, useremail.password)

            if (isMatch) {
                res.status(201).render("sell_product", {
                    title: "Login",
                    message: "Login Successfull"
                });
            }
            else {
                res.send("Invalid Credentials");
            }
        }
        else {
            res.send("Need to register first")
        }

    } catch (error) {
        res.status(400).send(error);
    }
})



app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
});
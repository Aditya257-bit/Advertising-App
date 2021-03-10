const { Router } = require("express");
const express = require("express");
const router = express.Router();
const SellProduct = require("../models/user");
const multer = require("multer");
const Register = require("../models/register");
const fs = require("fs");


//Upload Image
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});


const upload = multer({
    storage: storage
}).single("image");



//Routes 
router.get("/users", (req, res) => {
    SellProduct.find().exec((err, products) => {
        if (err) {
            res.json({ message: err.message });
        }
        else {
            res.render("index", {
                title: "Product to Sell",
                user: products
            })
        }
    })
});

router.get("/sell", (req, res) => {
    res.render("sell_product", { title: "Sell Product" });
});

router.post("/sell", upload, (req, res) => {

    let registeredEmail = req.body.email;

    let userRegisteredEmail = Register.findOne({ email: registeredEmail });

    if (userRegisteredEmail) {
        let user = new SellProduct({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            price: req.body.price,
            selltype: req.body.selltype,
            image: req.file.filename
        });
        let savedUser = user.save((err) => {
            if (err) {
                res.json({ message: err.message, type: "danger" })
            }
            else {
                req.session.message = {
                    type: "success",
                    message: "Product Added Successfully"
                };
                res.redirect("/users");
            }
        })
    }
    else {
        res.send("Need to register first")
    }
});

router.get("/edit/:id", (req, res) => {
    let id = req.params.id;
    SellProduct.findById(id, (err, user) => {
        if (err) {
            res.redirect("users");
        }
        else {
            if (user == null) {
                res.redirect('/user');
            }
            else {
                res.render("edit_product", {
                    title: "Edit Product",
                    user: user
                })
            }
        }
    })
});

router.post("/update/:id", upload, (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;
        try {
            fs.unlinkSync("./uploads/" + req.body.old_image);
        }
        catch (err) {
            console.log(err);
        }
    }
    else {
        new_image = req.body.old_image;
    }

    SellProduct.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        price: req.body.price,
        selltype: req.body.selltype,
        image: new_image
    }, (err, result) => {
        if (err) {
            res.json({ message: err.message, type: "danger" })
        }
        else {
            req.session.message = {
                type: "success",
                message: "Product Updated Successfully"
            };
            res.redirect("/users");
        }
    })
})

router.get("/delete/:id", (req, res) => {
    let id = req.params.id;
    SellProduct.findByIdAndRemove(id, (err, result) => {
        if (result.image != "") {
            try {
                fs.unlinkSync('./uploads' + result.image);
            }
            catch (err) {
                console.log(err);
            }
        }

        if (err) {
            res.json({
                message: err.message,
                type: "danger"
            })
        }
        else {
            req.session.message = {
                type: "success",
                message: "Product Deleted Successfully"
            }
            res.redirect("/users");
        }
    })
})

module.exports = router;
const express = require("express");
const userModel = require("../db")
const router = express.Router();
const zod = require("zod");
const {JWT_SECRET} =require("../config")

const signupSchema = zod.object({
    username: zod.string.email(),
    password: zod.string(),
    firstName: zod.string(),
    lastName: zod.string()
})
router.post("/signup", async(req, res) => {
    const body = req.body;
    const {success} = signupSchema.safeParse(body);
    if(!success) {
        return res.json({
            message: "email already taken/ incorrect input"
        })
    }

    const existingUser = userModel.findOne({
        username: req.body.username
    })

    if(existingUser) {
        return res.status(404).json({
            messgae: "user already signed up!!"
        })
    } 

    const user = await userModel.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName
    })

    const userId = user._id;

    const token = jwt.sign({
        userId
    }, JWT_SECRET)

    res.json({
        message: "user created successfully!!",
        token: token
    })
})

router.post("/signin", (req, res) => {

})

const siginSchema = zod.object({
    username: zod.string.email(),
    password: zod.string()
})

router.post("/signin", (req, res) => {
    const {success} = siginSchema.safeParse(req.body);
    if(!success) {
        return res.status(411).json({
            message: "invalid username or password"
        })
    }
    
})

module.exports = router;

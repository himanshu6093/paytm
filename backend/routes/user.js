const express = require("express");
const userModel = require("../db")
const router = express.Router();
const zod = require("zod");
const {JWT_SECRET} =require("../config");
const { authMiddleware } = require("../middleware");

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

    const user = userModel.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if(user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        })

        return
    }

    res.status(411).json({
        message: "Error while logging in !!"
    })

})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/", authMiddleware, async(req, res) => {
    const {success} = updateBody.safeParse(req.body);
    if(!success) {
        return res.status(403).json({
            message: "incorrect input"
        })
    }

    await userModel.updateOne(
        {_id: req.userId},
        {$set: req.body}
    )

    res.json({
        message: "updated successfully"
    })
})

router.get("/bulk", async(req, res) => {
    const filter = req.query.filter || "";

    const users = await userModel.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})




module.exports = router;

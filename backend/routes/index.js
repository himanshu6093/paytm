const express = require("express");
const userRouter = require("./user")
const router = express.Router();

router.use("/use", userRouter);


module.exports = router;


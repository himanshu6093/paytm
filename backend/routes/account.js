const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    })
    res.json({
        balance: account.balance
    })
})



router.get("/transaction", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { amount, to } = req.body;

    const account = await Account.findOne({ userId: req.userId }).session(session);

    if (!account || account.balance < amount) {
        session.abortTransaction();
        return res.status(403).json({
            message: "insufficient balance!!"
        })
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
        session.abortTransaction();
        return res.status(403).json({
            messsage: "no account found!"
        })
    }

    await Account.updateOne(
        { userId: req.userId },
        { $inc: { balance: -amount } }
    ).session(session);

    await Account.updateOne(
        { userId: to },
        { $inc: { balance: amount } }
    ).session(session);

    await session.commitTransaction();

    res.json({
        message: "Transaction completed successfully!!"
    })



})

module.exports = router;

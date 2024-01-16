const Razorpay = require("razorpay");
const Order = require("../models/orders");
const User = require("../models/user");

require("dotenv").config();

const rzpKeyID = process.env.RZP_KEY_ID;
const rzpKeySecret = process.env.RZP_KEY_SECRET;

exports.purchasePremium = (req, res, next) => {
  var rzp = new Razorpay({
    key_id: rzpKeyID,
    key_secret: rzpKeySecret,
  });

  try {
    const options = {
      amount: 10 * 100, // amount == Rs 10
      currency: "INR",
    };
    rzp.orders.create(options, async function (err, order) {
      if (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
      Order.create({
        orderId: order.id,
        paymentId: null,
        status: "PENDING",
        userId: req.user.id,
      })
        .then((result) => {
          return res.status(200).json({ order, key_id: rzp.key_id });
        })
        .catch((err) => console.log(err));
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something Went Wrong",
    });
  }
};

exports.updateTransaction = (req, res, next) => {
  try {
    // getting the details back from our font-end
    const { razorpayPaymentId, razorpayOrderId } = req.body;

    console.log(req.body);

    Order.findAll({
      where: { userId: req.user.id, orderId: req.body.orderCreationId },
    })
      .then((order) => {
        order[0].paymentId = razorpayPaymentId;
        order[0].status = "SUCCESS";
        return order[0].save();
      })
      .then(() => {
        User.findByPk(req.user.id).then((user) => {
          user.isPremiumuser = true;
          return user.save();
        });
      })
      .then(() => {
        return res.json({
          msg: "success",
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    return res.status(500).send(error);
  }
};

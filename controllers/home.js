const Expense = require("../models/expense");
const User = require("../models/user");
const sequelize = require("../util/database");

const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

const connectionString = process.env.AZURE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;

exports.postExpenses = async (req, res, next) => {
  const t = await sequelize.transaction();
  Expense.create(
    {
      amount: req.body.amount,
      description: req.body.description,
      category: req.body.category,
      subCategory: req.body.subCategory,
      userId: req.user.id,
    },
    { transaction: t }
  )
    .then(() => {
      User.findByPk(req.user.id, { transaction: t })
        .then((user) => {
          if (req.body.category === "Income") {
            user.totalIncome = user.totalIncome + +req.body.amount;
          } else {
            user.totalExpense = user.totalExpense + +req.body.amount;
          }

          return user.save({ transaction: t });
        })
        .then(async (result) => {
          await t.commit();
          return res.status(200).json({
            success: true,
            message: "Added Item successfully",
          });
        })
        .catch(async (err) => {
          await t.rollback();
          console.log(err);
        });
    })

    .catch(async (err) => {
      await t.rollback();
      console.log(err);
    });
};

exports.getUser = (req, res, next) => {
  let userId = req.user.id;
  User.findByPk(userId)
    .then((user) => {
      return res.status(200).json({
        success: true,
        message: "fetched user successfully",
        user: user,
      });
    })
    .catch((err) => console.log(err));
};

exports.getAllExpenses = (req, res, next) => {
  let userId = req.user.id;
  Expense.findAll({ where: { userId: userId }, order: [["id", "DESC"]] })
    .then((result) => {
      return res.status(200).json({
        success: true,
        message: "fetched expenses successfully",
        data: result,
        isPremiumUser: req.user.isPremiumuser,
      });
    })
    .catch((err) => console.log(err));
};

exports.getFilteredExpenses = (req, res, next) => {
  let userId = req.user.id;
  let itemToSearch = req.params.id;
  const noOfItem = +req.query.items;
  console.log(typeof req.query.items);

  if (itemToSearch === "all") {
    let page = req.query.page || 1;
    let totalItems;
    let userId = req.user.id;
    Expense.count()
      .then((total) => {
        totalItems = total;
        return Expense.findAll({
          where: { userId: userId },
          order: [["id", "DESC"]],
          offset: (page - 1) * noOfItem,
          limit: noOfItem,
        });
      })

      .then((product) => {
        return res.status(200).json({
          success: true,
          message: "fetched expenses successfully",
          data: {
            products: product,
            currentPage: page,
            lastPage: Math.ceil(totalItems / noOfItem),
          },
          isPremiumUser: req.user.isPremiumuser,
        });
      })
      .catch((err) => console.log(err));
  } else {
    Expense.findAll({ where: { userId: userId, subCategory: itemToSearch } })
      .then((result) => {
        // console.log(result);
        return res.status(200).json({
          success: true,
          message: "fetched expenses successfully",
          data: result,
          isPremiumUser: req.user.isPremiumuser,
        });
      })
      .catch((err) => console.log(err));
  }
};

exports.deleteExpense = async (req, res, next) => {
  const t = await sequelize.transaction();
  Expense.findAll(
    { where: { userId: req.user.id, id: req.params.id } },
    { transaction: t }
  )
    .then((item) => {
      User.findByPk(req.user.id, { transaction: t })
        .then((user) => {
          // console.log(req.body.category, typeof req.body.category);
          if (req.body.category === "Income") {
            user.totalIncome = user.totalIncome - +req.body.amount;
          } else {
            user.totalExpense = user.totalExpense - +req.body.amount;
          }
          return user.save({ transaction: t });
        })
        .then(() => {
          return item[0].destroy();
        })
        .then(async (result) => {
          await t.commit();
          return res.status(200).json({
            success: true,
            message: "Deleted expense successfully",
          });
        })
        .catch(async (err) => {
          await t.rollback();
          console.log(err);
        });
    })

    .catch(async (err) => {
      await t.rollback();
      console.log(err);
    });
};

async function uploadFileToBlob(filename, expenseData) {
  const blobName = filename;

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const contentLength = Buffer.from(expenseData).length;

  await blockBlobClient.upload(expenseData, contentLength);
  return blockBlobClient.url;
}

uploadFileToBlob().catch((error) => {
  console.error("Error uploading file:", error.message);
});

exports.dowloadExpenses = async (req, res) => {
  try {
    const expense = await Expense.findAll({
      where: {
        userId: req.user.id,
      },
    });
    const stringifiedExpenses = JSON.stringify(expense);
    console.log(stringifiedExpenses);
    const filename = `Expenses${req.user.id}/${new Date()}`;
    const fileUrl = await uploadFileToBlob(filename, stringifiedExpenses);
    console.log(fileUrl);

    return res.status(200).json({
      success: true,
      message: "Successfull",
      fileurl: fileUrl,
    });
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: err });
  }
};

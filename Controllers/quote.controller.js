const router = require("express").Router();
const { quoteModel } = require("../Models/quote.model");
const { userModel } = require("../Models/user.model");
const { employeeModel } = require("../Models/employee.model");
const jwt = require("jsonwebtoken");

//Service Request quote
router.post("/servicerequest/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { serviceRequest, description } = req.body;
    const user = await userModel.findOne({ _id: userId });
    let status = "";
    if (user.queryId.length == 0) {
      status = "New";
    } else {
      status = "Contacted";
    }
    const data = {
      userId,
      serviceRequest,
      description,
      status,
      queryStatus: "Open",
    };

    const quote = await quoteModel.create(data);
    const userDealId = user.dealId;
    const totalDealId = [...userDealId, quote._id];
    user.dealId = totalDealId;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Service Request Send Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//assigning quote
router.put("/assign/:employeeId/:quoteId", async (req, res) => {
  try {
    const { employeeId, quoteId } = req.params;
    const quote = await quoteModel.findOne({ _id: quoteId });

    const employee = await employeeModel.findOne({ _id: employeeId });

    quote.employeeId = employee._id;
    quote.quoteStatus = "Open";
    await quote.save();

    res.status(200).json({
      success: true,
      message: "Quote Assigned Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//Update quote query - Service Request quote
router.post("/update/:employeeId/:dealId", async (req, res) => {
  try {
    const { employeeId, dealId } = req.params;
    const { remark, quoteStatus } = req.body;
    const employee = await employeeModel.findOne({ _id: employeeId });
    const quote = await quoteModel.findOne({ _id: dealId });

    quote.remark = remark;
    quote.quoteStatus = quoteStatus;
    quote.employeeId = employeeId;
    quote.closedAt = new Date().toString();
    await quote.save();

    const employeeDealId = employee.dealId;
    employee.dealId = [...employeeDealId, quote._id];
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Service Request  Closed Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

const validate = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const data = await jwt.decode(token);
    if (Math.round(new Date() / 1000) < data.exp) {
      next();
    } else {
      res.status(400).json({
        message: "Token Experied",
      });
    }
  } else {
    res.status(400).json({
      message: "Token Not Found",
    });
  }
};

//Get Quote Data
router.get("/data", validate, async (req, res) => {
  try {
    const quote = await quoteModel.find();
    res.status(200).json({
      success: true,
      message: "Quote Data Fetched Successfully",
      data: quote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//Get Quote Data By ID
router.get("/data/:id", async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.id });
    const quote = await quoteModel.find();
    const qId = user.queryId;
    if (qId.length == 0) {
      res.status(200).json({
        success: true,
        message: "Quote Data Fetched Successfully",
        data: [],
      });
    } else {
      const filterdData = quote.filter((data) => {
        return qId.includes(data._id);
      });
      res.status(200).json({
        success: true,
        message: "Quote Data Fetched Successfully",
        data: filterdData,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//Get employee quote data by id
router.get("/data/employee/:id", async (req, res) => {
  try {
    const employeeQuote = await quoteModel.find({ employeeId: req.params.id });
    res.status(200).json({
      success: true,
      message: "Quote Data Fetched Successfully",
      data: employeeQuote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

module.exports = router;

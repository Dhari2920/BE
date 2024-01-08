const { serviceModel } = require("../Models/service.model");
const jwt = require("jsonwebtoken");

const router = require("express").Router();

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

//get Service Details
router.get("/data", validate, async (req, res) => {
  try {
    const service = await serviceModel.findOne({
      _id: "6499b53bcc3c57720a71e25c",
    });
    res.status(200).json({
      success: true,
      message: "Service Data Fetched Successfully",
      data: service.serviceName,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//add Service
router.post("/add", async (req, res) => {
  try {
    const { serviceName } = req.body;
    const service = await serviceModel.findOne({
      _id: "6499b53bcc3c57720a71e25c",
    });
    const oldData = service.serviceName;
    const newData = [...oldData, serviceName];
    service.serviceName = newData;
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//update Service
router.post("/update/:index", async (req, res) => {
  try {
    const { serviceName } = req.body;
    const service = await serviceModel.findOne({
      _id: "6499b53bcc3c57720a71e25c",
    });
    service.serviceName[req.params.index] = serviceName;
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//delete Service
router.delete("/delete/:index", async (req, res) => {
  try {
    const service = await serviceModel.findOne({
      _id: "6499b53bcc3c57720a71e25c",
    });
    const data = service.serviceName;
    data.splice(req.params.index, 1);
    service.serviceName = data;
    await service.save();

    res.status(200).json({
      success: true,
      message: "Service Deleted Successfully",
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

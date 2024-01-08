const { employeeModel } = require("../Models/employee.model");
const { ticketModel } = require("../Models/ticket.model");
const { userModel } = require("../Models/user.model");
const jwt = require("jsonwebtoken");

const router = require("express").Router();

//Create ticken
router.post("/create/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { subject, description } = req.body;
    const data = {
      userId,
      subject,
      description,
    };
    const ticket = await ticketModel.create(data);
    const user = await userModel.findOne({ _id: userId });
    const userQueryId = user.queryId;
    const totalQueryId = [...userQueryId, ticket._id];
    user.queryId = totalQueryId;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Ticket Created Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//assigning ticken
router.put("/assign/:employeeId/:ticketId", async (req, res) => {
  try {
    const { employeeId, ticketId } = req.params;
    const ticket = await ticketModel.findOne({ _id: ticketId });

    const employee = await employeeModel.findOne({ _id: employeeId });
    ticket.employeeId = employee._id;
    ticket.status = "Open";
    await ticket.save();

    res.status(200).json({
      success: true,
      message: "Ticket Assigned Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//Update ticken
router.put("/update/:userId/:ticketId", async (req, res) => {
  try {
    const { userId, ticketId } = req.params;
    const { description, status } = req.body;
    const ticket = await ticketModel.findOne({ _id: ticketId });
    const employee = await employeeModel.findOne({ _id: userId });

    const user = await userModel.findOne({ _id: userId });

    if (user !== null) {
      const data = {
        role: "User",
        description,
        createdAt: new Date().toString(),
      };
      const userRemark = ticket.remark;
      const totalRemark = [...userRemark, data];
      ticket.remark = totalRemark;
      await ticket.save();
      res.status(200).json({
        success: true,
        message: "Ticket updated Successfully",
      });
    }
    if (employee !== null) {
      const data = {
        role: "Employee",
        description,
        createdAt: new Date().toString(),
      };
      const remark = ticket.remark;
      const totalRemark = [...remark, data];
      if (status == "Closed") {
        ticket.closedAt = new Date().toString();
      }
      ticket.remark = totalRemark;
      ticket.status = status;
      await ticket.save();
      res.status(200).json({
        success: true,
        message: "Ticket updated Successfully",
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

//get ticket data
router.get("/data", validate, async (req, res) => {
  try {
    const ticket = await ticketModel.find();
    res.status(200).json({
      success: true,
      message: "Ticket Data Fetched Successfully",
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//get user ticket data by id
router.get("/data/:id", async (req, res) => {
  try {
    const userTicket = await ticketModel.find({ userId: req.params.id });
    res.status(200).json({
      success: true,
      message: "Ticket Data Fetched Successfully",
      data: userTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//get employee ticket data by id
router.get("/data/employee/:id", async (req, res) => {
  try {
    const employeeTicket = await ticketModel.find({
      employeeId: req.params.id,
    });
    res.status(200).json({
      success: true,
      message: "Ticket Data Fetched Successfully",
      data: employeeTicket,
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

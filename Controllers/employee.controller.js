const router = require("express").Router();
const { employeeModel } = require("../Models/employee.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = "da%ui#43F%d^3*4u346h";

//Employee SignUp

router.post("/signup", async (req, res) => {
  try {
    const employee = await employeeModel.findOne({ email: req.body.email });
    if (!employee) {
      const { firstName, lastName, email, password, role } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const data = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
      };
      const employee = await employeeModel.create(data);
      res.status(200).json({
        success: true,
        message: "User SignUp Successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User Already Exist",
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

//Employee Login

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await employeeModel.findOne({ email: req.body.email });

    if (employee) {
      if (await bcrypt.compare(password, employee.password)) {
        const token = await jwt.sign(
          {
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
          },
          secretKey,
          { expiresIn: "1d" }
        );
        res.status(200).json({
          success: true,
          message: "User SignIn Successfully",
          token,
          id: employee._id,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Invalid Password",
        });
      }
    } else
      res.status(400).json({
        success: false,
        message: "User Does't Exist",
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

//Employee Data

router.get("/data", validate, async (req, res) => {
  try {
    const employee = await employeeModel.find();
    res.status(200).json({
      success: true,
      message: "Employee Data Fetched Successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//Employee Data By ID

router.get("/data/:id", validate, async (req, res) => {
  try {
    const employee = await employeeModel.findOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: "Employee Data Fetched Successfully",
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//Edit Employee Details

router.post("/update/:id", async (req, res) => {
  try {
    const { firstName, lastName, role } = req.body;
    const employee = await employeeModel.findOne({ _id: req.params.id });
    employee.firstName = firstName;
    employee.lastName = lastName;
    employee.role = role;

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee Data Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

//Delete Employee Data

router.delete("/delete/:id", async (req, res) => {
  try {
    const user = await employeeModel.deleteOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
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

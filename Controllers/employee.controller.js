const router = require("express").Router();
const { employeeModel } = require("../Models/employee.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secretKey = "ccLTI4O8Y0OOhTuugyUZqIvYR6E7Pt8k";

// Employee SignUp
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

      await employeeModel.create(data);

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

// Employee Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const employee = await employeeModel.findOne({ email });

    if (employee) {
      const isPasswordValid = await bcrypt.compare(password, employee.password);

      if (isPasswordValid) {
        const token = jwt.sign(
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
    } else {
      res.status(400).json({
        success: false,
        message: "User Doesn't Exist",
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

// Middleware to validate JWT token
const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token Not Found",
    });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);
    req.employee = decodedToken;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Token Expired or Invalid",
    });
  }
};

// Employee Data
router.get("/data",  async (req, res) => {
  try {
    const employeeData = await employeeModel.find();
    res.status(200).json({
      success: true,
      message: "Employee Data Fetched Successfully",
      data: employeeData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

// Employee Data By ID
router.get("/data/:id", validateToken, async (req, res) => {
  try {
    const employee = await employeeModel.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
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

// Edit Employee Details
router.post("/update/:id", async (req, res) => {
  try {
    const { firstName, lastName, role } = req.body;
    const employee = await employeeModel.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, role },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

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

// Delete Employee Data
router.delete("/delete/:id", async (req, res) => {
  try {
    const employee = await employeeModel.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Employee Deleted Successfully",
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

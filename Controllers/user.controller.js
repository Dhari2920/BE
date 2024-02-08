const router = require("express").Router();
const { userModel } = require("../Models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWTD = require("jwt-decode");
const nodemailer = require("nodemailer");

const secretKey = "da%ui#43F%d^3*4u346h";

// User SignUp
router.post("/signup", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      const {
        firstName,
        lastName,
        email,
        password,
        companyName,
        contactNumber,
      } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const secret = secretKey + req.body.email;
      const jwtToken = await jwt.sign({ email: email }, secret, {
        expiresIn: "15min",
      });

      const link = `http://localhost:3000/${jwtToken}`;

      const data = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        companyName,
        contactNumber,
      };
      const user = await userModel.create(data);

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "dhari2920@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const message = {
        from: "norepay",
        to: user.email,
        subject: `Please verify your email address`,
        html: `
        
         <h2>Hi ${firstName},</h2>

         <p>We just need to verify your email address before you can access ZEN CLASS portal.</p>

         <p>Verify your email address by clicking the link below</p>
         <a href=${link}> Verification Link</a>

         <p><b>Note:</b>The link expires 15 minutes from now</p>

         <p>Thanks!</p>                               
        
        `,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: "Something went wrong, Try again later",
            err,
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Verification Link Send To Your Mail Successfully",
          });
        }
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

// Email verification
router.post("/email/verification/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const decode = await JWTD(id);
    const secret = secretKey + decode.email;
    jwt.verify(id, secret, function (err, decoded) {
      if (err) {
        res.status(400).json({
          success: false,
          message: "URL Expired",
          err,
        });
      }
      if (decoded) {
        const varify = async () => {
          const user = await userModel.findOne({ email: decode.email });
          user.account = "active";
          await user.save();

          res.status(200).json({
            success: true,
            message: "Email Varified SuccessFully",
            decoded,
          });
        };
        varify();
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      if (user.account == "active") {
        const { email, password } = req.body;
        if (await bcrypt.compare(password, user.password)) {
          const token = await jwt.sign(
            {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            },
            secretKey,
            { expiresIn: "1h" }
          );
          res.status(200).json({
            success: true,
            message: "User SignIn Successfully",
            token,
            id: user._id,
          });
        } else {
          res.status(400).json({
            success: false,
            message: "Invalid Password",
          });
        }
      } else {
        const secret = secretKey + user.email;
        const jwtToken = await jwt.sign({ email: user.email }, secret, {
          expiresIn: "1d",
        });

        const link = `http://localhost:3000/${jwtToken}`;


        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "dhari2920@gmail.com",
            pass: process.env.EMAIL_PASSWORD,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        const message = {
          from: "norepay",
          to: user.email,
          subject: `Please verify your email address`,
          html: `
                    
                     <h2>Hi ${user.firstName},</h2>
            
                     <p>We just need to verify your email address before you can access ZEN CLASS portal.</p>
            
                     <p>Verify your email address by clicking the link below</p>
                     <a href=${link}> Verification Link</a>
            
                     <p><b>Note:</b>The link expires 15 minutes from now</p>
            
                     <p>Thanks!</p>                               
                    
                    `,
        };

        transporter.sendMail(message, (err, info) => {
          if (err) {
            res.status(400).json({
              success: false,
              message: "Something went wrong, Try again later",
              err,
            });
          } else {
            res.status(400).json({
              success: false,
              message:
                "Please Verify The Email. Verification Link Send To Your Mail Successfully",
            });
          }
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

// User Forget Password
router.post("/forget-password", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      const secret = secretKey + user._id;
      const token = await jwt.sign(
        { email: user.email, id: user._id },
        secret,
        { expiresIn: "15min" }
      );
      const link = `http://localhost:3000/${user._id}/${token}`;
      user.token = token;
      await user.save();

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "dhari2920@gmail.com",
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      const message = {
        from: "norepay.dhari",
        to: user.email,
        subject: "Password reset request",
        html: `<h2>Hello ${user.name}</h2>
              <p>We've recieved a request to reset the password for your account associated with your email.
              You can reset your password by clicking the link below</p>
              <a href=${link}> Reset Password</a>
              <p><b>Note:</b>The link expires 15 minutes from now</p>
              `,
      };

      transporter.sendMail(message, (err, info) => {
        if (err) {
          res.status(400).json({
            success: false,
            message: "Something went wrong, Try again later",
            err,
          });
        } else {
          res.status(200).json({
            success: true,
            message: "Password Reset link sent to your mail",
          });
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User Does't Exist",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

// User Reset Password
router.post("/reset-password/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const user = await userModel.findOne({ _id: id });
  const secret = secretKey + user._id;

  const decode = await JWTD(token);

  if (Math.round(new Date() / 1000) <= decode.exp) {
    try {
      if (user && user.token == token) {
        const verify = jwt.verify(token, secret);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        user.password = hashedPassword;
        user.token = "";
        await user.save();
        res.status(200).json({
          success: true,
          message: "User Password Changed Successfully",
        });
      } else {
        res.status(200).json({
          success: false,
          message: "Invaild link",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error,
      });
    }
  } else {
    res.json({
      success: false,
      message: "Link expired",
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

//Get user Data
router.get("/data", validate, async (req, res) => {
  try {
    const user = await userModel.find();
    res.status(200).json({
      success: true,
      message: "User Data Fetched Successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

// Get User Data By Id
router.get("/data/:id", validate, async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: "User Data Fetched Successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

// Updata User Data
router.post("/update/:id", async (req, res) => {
  try {
    const { firstName, lastName, companyName, contactNumber, address } =
      req.body;
    const user = await userModel.findOne({ _id: req.params.id });
    user.firstName = firstName;
    user.lastName = lastName;
    user.companyName = companyName;
    user.contactNumber = contactNumber;
    user.address = address;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User Data Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
});

// Delete User Data
router.delete("/delete/:id", async (req, res) => {
  try {
    const user = await userModel.deleteOne({ _id: req.params.id });
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

const express =require("express")
const app = express()
const MongoDBConnection = require('./DbConfig/dbConfig')
const employeeRouter = require('./Controllers/employee.controller')
const userRouter = require('./Controllers/user.controller')
const quoteRouter = require('./Controllers/quote.controller')
const serviceRouter = require('./Controllers/service.controller')
const ticketRouter = require('./Controllers/ticket.controller')
const cors = require("cors")
require('dotenv').config()

MongoDBConnection()

app.use(cors())
app.use(express.json())
app.get("/" ,(req,res)=>res.send('welcome'))
app.use('/employee',employeeRouter)
app.use('/user',userRouter)
app.use('/quote',quoteRouter)
app.use('/service',serviceRouter)
app.use('/ticket',ticketRouter)

const DEFAULT_PORT = 3000; 
app.listen(process.env.PORT,()=>console.log(`Server is running is ${process.env.PORT} PORT`))
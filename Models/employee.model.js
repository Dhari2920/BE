const mongoose = require("mongoose")
const validator = require('validator')


const employeeSchema = new mongoose.Schema({
    firstName:{type:String,require:true},
    lastName:{type:String,require:true},
    email:{type:String,require:true, validate:(value)=> validator.isEmail(value)},
    password:{type:String,require:true},
    role:{type:String,require:true},
    queryId:{type:Array,default:[],require:false},
    dealId:{type:Array,default:[],require:false},
    createdAt:{type:Date,default:new Date().toString()}
})

const employeeModel = mongoose.model('employee',employeeSchema)

module.exports={employeeModel}
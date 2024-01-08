const mongoose = require("mongoose")

const ticketSchema = new mongoose.Schema({
    userId:{type:String,require:true},
    subject:{type:String,require:true},
    status:{type:String,default:"Pending",require:false},
    description:{type:String,require:true},
    employeeId:{type:String,default:null,require:false},
    createdAt:{type:Date,default:new Date().toString()},
    closedAt:{type:Date,default:null,require:false},
    remark:{type:Array,default:[],require:false}
})

const ticketModel = mongoose.model('ticket',ticketSchema)

module.exports={ticketModel}
const mongoose = require("mongoose")

const quoteSchema = new mongoose.Schema({
    userId:{type:String,require:true},
    serviceRequest:{type:Array,require:true},
    description:{type:String,require:true},
    status:{type:String,require:true},
    quoteStatus:{type:String,default:"Pending",require:true},
    employeeId:{type:String,default:null,require:false},
    createdAt:{type:Date,default:Date.now()},
    closedAt:{type:Date,default:null,require:false},
    remark:{type:String,default:null,require:false}
})

const quoteModel = mongoose.model('quote',quoteSchema)

module.exports={quoteModel}
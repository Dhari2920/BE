const mongoose = require("mongoose")

const serviceSchema = new mongoose.Schema({
    serviceName:{type:Array,default:[],require:false},
})

const serviceModel = mongoose.model('service',serviceSchema)

module.exports={serviceModel}
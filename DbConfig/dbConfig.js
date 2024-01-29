const mongoose = require('mongoose')

module.exports = async()=>{
    try {
        const connect = await  mongoose.connect('mongodb+srv://dharika29:Dharika2920@cluster0.pkez5lo.mongodb.net/')
        console.log("MongoDB connected Successfully")
     } catch (error) {
         console.log(error)
     }
}
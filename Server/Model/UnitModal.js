
const mongoose  = require('mongoose')

const UnitModal = new mongoose.Schema({

    unitname:{
        type:String
    }
})

module.exports = mongoose.model("Unit",UnitModal)

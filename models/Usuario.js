const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        require: true
    },
    created: {
        type: Date,
        default: Date.now()
    }

})

mongoose.model("usuario", Usuario)
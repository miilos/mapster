const mongoose = require('mongoose')

const followsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    following: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
})

const Follow = mongoose.model('Follow', followsSchema)
module.exports = Follow
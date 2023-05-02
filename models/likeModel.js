const mongoose = require('mongoose')

const likeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    }
})

const Like = mongoose.model('Like', likeSchema)
module.exports = Like
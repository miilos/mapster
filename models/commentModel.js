const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [ true, 'You can\'t make an empty comment' ]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    post: {
        type: mongoose.Schema.ObjectId,
        ref: 'Post'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    numLikes: {
        type: Number,
        default: 0
    }
})

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment
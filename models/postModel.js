const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    text: String,
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: [ 'Point' ]
        },
        coordinates: [ Number ]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    comments: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Comment'
        }
    ],
    img: String,
    numLikes: {
        type: Number,
        default: 0
    },
    numComments: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

postSchema.index({ location: '2dsphere' })

const Post = mongoose.model('Post', postSchema)
module.exports = Post
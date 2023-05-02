const Post = require('../models/postModel')
const Comment = require('../models/commentModel')
const catchAsync = require('../utils/catchAsync')

exports.commentOnPost = catchAsync(async (req, res, next) => {
    const commentProperties = {
        user: req.user._id,
        post: req.params.id,
        ...req.body
    }

    const comment = await Comment.create(commentProperties)

    await Post.findByIdAndUpdate(req.params.id, { 
        $inc: { numComments: 1 },
        $push: { comments: comment._id }
    })

    res.status(201).json({
        status: 'success',
        data: {
            comment
        }
    })
})

exports.likeComment = catchAsync(async (req, res, next) => {
    const comment = await Comment.findByIdAndUpdate(req.params.commentId, { $inc: { numLikes: 1 } })

    res.status(200).json({
        status: 'success',
        data: {
            comment
        }
    })
})
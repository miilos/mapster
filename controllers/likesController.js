const Like = require('../models/likeModel')
const Post = require('../models/postModel')
const catchAsync = require('../utils/catchAsync')

exports.likePost = catchAsync(async (req, res, next) => {
    const result = await Like.findOneAndUpdate({
        user: req.user._id,
        post: req.params.id
    },
    {
        user: req.user._id,
        post: req.params.id
    },
    {
        upsert: true,
        rawResult: true
    })

    if(!result.lastErrorObject.updatedExisting)
        await Post.findByIdAndUpdate(req.params.id, { $inc: { numLikes: 1 } })

    res.status(201).json({
        status: 'success',
        data: {
            result: result.value,
            message: 'Liked!'
        }
    })
})

exports.unlikePost = catchAsync(async (req, res, next) => {
    const result = await Like.findOneAndDelete({
        user: req.user._id,
        post: req.params.id,
    })

    if(result && result.deletedCount !== 0)
        await Post.findByIdAndUpdate(req.params.id, { $inc: { numLikes: -1 } })

    res.status(204).json({
        status: 'success',
        message: 'Unliked!'
    })
})

exports.getLikesPostsByUser = catchAsync(async (req, res, next) => {
    const likes = await Like.find({ user: req.user._id })

    res.status(200).json({
        status: 'success',
        data: {
            likes
        }
    })
})
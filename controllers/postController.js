const Post = require('../models/postModel')
const User = require('../models/userModel')
const Comment = require('../models/commentModel')
const Follow = require('../models/followsModel')
const catchAsync = require('../utils/catchAsync')

exports.getAllPosts = catchAsync(async (req, res, next) => {
    const posts = await Post.find()

    res.status(200).json({
        status: 'success',
        results: posts.length,
        data: {
            posts
        }
    })
})

exports.getPost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id).populate('comments user')

    res.status(200).json({
        status: 'success',
        data: {
            post
        }
    })
})

exports.createPost = catchAsync(async (req, res, next) => {
    const post = await Post.create({ ...req.body, location: req.user.location, user: req.user._id })

    // add post ref to user
    await User.findByIdAndUpdate(req.user._id, { 
        $push: { posts: post._id },
        $inc: { numPosts: 1 }
    })

    res.status(201).json({
        status: 'success',
        data: {
            post
        }
    })
})

exports.getPostsFromFollowing = catchAsync(async (req, res, next) => {
    let following = await Follow.find({
        user: req.user._id
    })

    following = following.map(curr => curr.following)

    const posts = await Post.find({
        user: { $in: following }
    })
     .sort({ createdAt: -1 })
     .populate('user')

    res.status(200).json({
        status: 'success',
        results: posts.length,
        data: {
            posts
        }
    })
})

exports.getPostsWithinRange = catchAsync(async (req, res, next) => {
    const coords = req.user.location.coordinates

    const posts = await Post.find({
        location: {
            $geoWithin: { $centerSphere: [ coords, .05 ] }
        }
    })
     .sort({ createdAt: -1 })
     .populate('user')

    res.status(200).json({
        status: 'success',
        results: posts.length,
        data: {
            posts
        }
    })
})
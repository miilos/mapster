const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const Post = require('../models/postModel')
const Like = require('../models/likeModel')
const catchAsync = require('../utils/catchAsync')
const Follow = require('../models/followsModel')

// render profile for logged in user
const renderProfile = async (req, res, next) => {
    const token = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

    const user = await User.findById(token.id).select('-location -__v').populate({
        path: 'posts',
        select: '-location -__v',
        options: {
            sort: [ { 'createdAt': 'desc' } ]
        }
    })

    const userLikes = (await Like.find({ user: user._id })).map(curr => curr.post.toString())

    res.status(200).render('profile', {
        title: 'Home',
        user: user,
        likes: userLikes,
        loggedInUser: true
    })
}

exports.mainPage = catchAsync(async (req, res, next) => {
    if(req.cookies.jwt) {
        renderProfile(req, res, next)
    }
    else {
        res.status(200).render('index', {
            title: 'Welcome'
        })
    }
})

exports.loginPage = catchAsync(async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Log in'
    })
})

exports.homePage = catchAsync(async (req, res, next) => {
    renderProfile(req, res, next)
})

// render other users' profiles
exports.profilePage = catchAsync(async (req, res, next) => {
    let handle

    if(req.params.handle) {
        handle = req.params.handle.startsWith('@') ? req.params.handle : `@${req.params.handle}`
    }
    /* else if (req.cookies.jwt) {
        const token = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
        const user = await User.findById(token.id)
        handle = user.handle
    } */

    const user = await User.find({ handle }).select('-location -__v').populate({
        path: 'posts',
        select: '-location -__v',
        options: {
            sort: [ { 'createdAt': 'desc' } ]
        }
    })

    const userLikes = (await Like.find({ user: user[0]._id })).map(curr => curr.post.toString())

    const token = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
    const currUser = await User.findById(token.id)
    const followedByCurrUser = await Follow.find({ 
        following: user[0]._id,
        user: currUser._id
    })

    res.status(200).render('profile', {
        title: user[0].handle,
        user: user[0],
        likes: userLikes,
        followedByCurrUser: followedByCurrUser.length > 0,
        loggedInUser: false
    })
})

exports.signupPage = catchAsync(async (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Sign up'
    })
})

exports.createPostPage = catchAsync(async (req, res, next) => {
    const token = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
    const user = await User.findById(token.id)

    res.status(200).render('createPost', {
        title: 'Create Post',
        user
    })
})

exports.commentsPage = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.postId)
        .populate('user')
        .populate({
            path: 'comments',
            options: {
                sort: [ { 'createdAt': 'desc' } ]
            },
            populate: {
                path: 'user'
            }
        })

    const token = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)
    const user = await User.findById(token.id)
    
    const likeExists = await Like.find({
        post: req.params.postId,
        user: user._id
    })

    res.status(200).render('comments', {
        title: 'Comments',
        post,
        liked: likeExists.length > 0,
        loggedInUser: user
    })
})

exports.likesPage = catchAsync(async (req, res, next) => {
    let usersLiked = await Like.find({
        post: req.params.postId
    }).populate('user')

    usersLiked = usersLiked.map(curr => curr.user)

    res.status(200).render('likes', {
        title: 'Likes',
        users: usersLiked
    })
})

exports.explorePage = catchAsync(async (req, res, next) => {
    res.status(200).render('explore', {
        title: 'Explore'
    })
})

exports.followingPage = catchAsync(async (req, res, next) => {
    let following = await Follow.find({ user: req.params.userId }).populate('following')
    following = following.map(curr => curr.following)

    res.status(200).render('followData', {
        title: 'Following',
        followData: following
    })
})

exports.followersPage = catchAsync(async (req, res, next) => {
    let followers = await Follow.find({ following: req.params.userId }).populate('user')
    followers = followers.map(curr => curr.user)

    res.status(200).render('followData', {
        title: 'Followers',
        followData: followers
    })
})

exports.settingsPage = catchAsync(async (req, res, next) => {
    res.status(200).render('settings', {
        title: 'Settings'
    })
})
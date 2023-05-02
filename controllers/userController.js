const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/userModel')
const Follow = require('../models/followsModel')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/AppError')

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().select('-location -__v')

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.find({ handle: `@${req.params.handle}` }).select('-location -__v').populate({
        path: 'posts',
        select: '-location -__v',
        options: {
            sort: [ { 'createdAt': 'desc' } ]
        }
    })

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

exports.follow = catchAsync(async (req, res, next) => {
    // 1) Add follow pair document to follows collection
    // upsert is used to prevent the same user following the same user multiple times
    // rawResult is used to be able to check if the document was updated or upserted, so follow counts dont get messed up
    // findOneAndUpdate() is used to have access to upsert and rawResult to simplify checking if the follow pair is unique
    const result = await Follow.findOneAndUpdate({
        user: req.user._id,
        following: req.params.followId
    },
    {
        user: req.user._id,
        following: req.params.followId
    },
    {
        upsert: true,
        rawResult: true
    })

    // Update follow counts only if the document was upserted (new unique follow) 
    if(!result.lastErrorObject.updatedExisting) {
        // 2) Increment numFollowing for logged in user
        await User.findByIdAndUpdate(req.user._id, { $inc: { numFollowing: 1 } })

        // 3) Increment numFollowers for other user
        await User.findByIdAndUpdate(req.params.followId, { $inc: { numFollowers: 1 } })
        
        // 4) Send response
        res.status(201).json({
            status: 'success',
            data: {
                data: result.value
            }
        })
    }
    else
        return next(new AppError('User already follows this user', 400))
})

exports.unfollow = catchAsync(async (req, res, next) => {
    // 1) Remove follow pair document from follows collection
    const result = await Follow.deleteOne({ 
        user: req.user._id, 
        following: req.params.followId
    })

    // Prevents incorrect follow and following counts in case the same user is unfollowed multiple times
    if(result && result.deletedCount !== 0) {
        // 2) Decrement numFollowing for logged in user
        await User.findByIdAndUpdate(req.user._id, { $inc: { numFollowing: -1 } })

        // 3) Decrement numFollowers for other user
        await User.findByIdAndUpdate(req.params.followId, { $inc: { numFollowers: -1 } })
    }

    // 4) Send response
    res.status(204).json({
        status: 'success',
        data: { }
    })
})

exports.getFollowers = catchAsync(async (req, res, next) => {
    const followers = await Follow.find({ following: req.params.id }).populate('user').select('-following')

    res.status(200).json({
        status: 'success',
        results: followers.length,
        data: {
            followers
        }
    })
})

exports.getFollowing = catchAsync(async (req, res, next) => {
    const following = await Follow.find({ user: req.params.id }).populate('following').select('-user')

    res.status(200).json({
        status: 'success',
        results: following.length,
        data: {
            following
        }
    })
})

// msm da se nigde ne koristi
exports.checkHandle = catchAsync(async (req, res, next) => {
    const handles = await User.find()
    let taken = false

    handles.forEach(curr => {
        if(curr.handle === `@${req.params.handle}`) {
            taken = true
        }
    })

    res.status(200).json({
        status: 'success',
        data: {
            taken
        }
    })
})

exports.searchUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({
        handle: { $regex: req.params.handle, $options: 'i' }
    })

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

exports.findUsersInRange = catchAsync(async (req, res, next) => {
    const coords = req.user.location.coordinates

    const users = await User.find({
        location: {
            $geoWithin: { $centerSphere: [ coords, .05 ] } // 0.05rad = 50km valjda
        },
        _id: { $ne: req.user._id }
    })

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
})

// image uploads on signup

/* const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/img/users')
    },
    filename: (req, file, cb) => {
        const extension = file.mimetype.split('/')[1]
        cb(null, `user-${Date.now()}.${extension}`)
    }
}) */

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    }
    else {
        cb(new AppError('Not an image! Please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadProfilePic = upload.single('profilePic')

exports.resizeProfilePic = (req, res, next) => {
    if(!req.file) return next()

    req.file.filename = `user-${Date.now()}.jpeg`

    sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`)

    next()
}
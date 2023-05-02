const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
const AppError = require('../utils/AppError')
const catchAsync = require('../utils/catchAsync')

const signJwt = id => {
    return jwt.sign(
        { id }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    )
}

const sendToken = (user, statusCode, res) => {
    const token = signJwt(user._id)

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 360 * 1000),
        httpOnly: true
    }

    if(process.env.NODE_ENV === 'prod')
        cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)

    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    if(req.file) {
        req.body.profilePic = `/users/${req.file.filename}`
    }

    const coords = req.body.location.split(' ')
    req.body.location = {
        coordinates: [ parseFloat(coords[0]), parseFloat(coords[1]) ]
    }

    const user = await User.create(req.body)
    sendToken(user, 201, res)    
})

exports.login = catchAsync(async (req, res, next) => {
    let { handle, password } = req.body

    if(!handle.startsWith('@'))
        handle = `@${handle}`

    if(!handle || !password)
        return next(new AppError('You need to specify your handle and password!', 400))

    const user = await User.findOne({ handle }).select('+password')

    if(!user || !(await user.checkPassword(password, user.password)))
        return next(new AppError('Wrong handle or password!', 401))

    sendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
    let token

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
        token = req.headers.authorization.split(' ')[1]
    else if(req.cookies.jwt)
        token = req.cookies.jwt

    if(!token)
        return next(new AppError('You aren\'t logged in! Please log in again!', 401))

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    
    if(!user)
        return next(new AppError('The user with this token no longer exists!', 401))

    req.user = user
    next()
})

exports.logout = catchAsync(async (req, res, next) => {
    res.clearCookie('jwt')

    res.status(200).send({
        status: 'success',
        message: 'Logged out!'
    })
})
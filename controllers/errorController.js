const AppError = require('../utils/AppError')

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        fullErr: err
    })
}

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}!`
    return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
    const key = Object.keys(err.keyPattern)[0]
    const value = err.keyValue[Object.keys(err.keyValue)[0]]

    const message = `The value for ${key}: ${value} already exists!`
    return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
    let message = ''

    Object.keys(err.errors).forEach(curr => {
        message += `${curr}: ${err.errors[curr].message}\n`
    })

    return new AppError(message, 400)
}

const sendErrorProd = (err, res) => {
    if(err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    }
    else {
        console.log({
            message: err.message,
            stack: err.stack,
            fullErr: err
        })

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong :('
        })
    }
}

module.exports = (err, req, res, next) => {
    err.status = err.status || 'error'
    err.statusCode = err.statusCode || 500

    if(process.env.NODE_ENV === 'dev') {
        sendErrorDev(err, res)
    }

    if(process.env.NODE_ENV === 'prod') {
        let error = { ...err }

        if(error.name === 'CastError') error = handleCastErrorDB(error)
        // if(error.message.startsWith('E11000')) error = handleDuplicateFieldsDB(error)
        if(error._message === 'User validation failed') error = handleValidationErrorDB(error)
        /* if(error.name === 'JsonWebTokenError') error = handleJWTError()
        if(error.name === 'TokenExpiredError') error = handleJWTExpiredError() */

        sendErrorProd(error, res)
    }
}
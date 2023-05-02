const path = require('path')
const express = require('express')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const rateLimit = require('express-rate-limit')
const hpp = require('hpp')
const xss = require('xss-clean')
const compression = require('compression')
const userRouter = require('./routes/userRoutes')
const postRouter = require('./routes/postRoutes')
const viewRouter = require('./routes/viewRoutes')
const likeRouter = require('./routes/likeRoutes')
const errorController = require('./controllers/errorController')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(mongoSanitize())

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP! Try again later'
})
app.use('/api', limiter)

app.use(hpp())
app.use(xss())
app.use(compression())

app.use('/', viewRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/posts', postRouter)
app.use('/api/v1/likes', likeRouter)

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: `There's no ${req.originalUrl} on this server!`
    })
})

app.use(errorController)

module.exports = app
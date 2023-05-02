const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!!!')
    console.log(err.name, err.message)
    process.exit(1)
})

dotenv.config({ path: './config.env' })

const db = process.env.DB_CONNECTION_STRING.replace('<password>', process.env.DB_PASSWORD)

mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to database!')
})

const port = process.env.PORT || 3300
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}!`)
})

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!!!')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})
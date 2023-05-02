const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Follow = require('./followsModel')

const userSchema = new mongoose.Schema({
    handle: {
        type: String,
        required: [ true, 'You have to set a handle' ],
        unique: [ true, 'That handle is already taken' ]
    },
    password: {
        type: String,
        required: [ true, 'You have to set a password' ],
        minlength: [ 8, 'Password should be at least 8 characters long' ],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [ true, 'You have to confirm your password' ],
        validate: {
            validator: function(val) {
                return val === this.password
            },
            message: 'Password and Confirm password have to match'
        }
    },
    bio: String,
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: [ 'Point' ]
        },
        coordinates: [ Number ]
    },
    profilePic: {
        type: String,
        default: '/users/default.png'
    },
    numFollowers: {
        type: Number,
        default: 0
    },
    numFollowing: {
        type: Number,
        default: 0
    },
    numPosts: {
        type: Number,
        default: 0
    },
    posts: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Post'
        }
    ],
    verified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

userSchema.index({ location: '2dsphere' })

userSchema.pre('save', function(next) {
    if(this.handle.startsWith('@')) 
        return next()    
    
    this.handle = '@' + this.handle

    next()
})

userSchema.pre('save', async function(next) {
    if(!this.isModified('password'))
        return next()
        
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined

    next()
})

userSchema.methods.checkPassword = async function(passToCheck, userPass) {
    return await bcrypt.compare(passToCheck, userPass)
}

const User = mongoose.model('User', userSchema)

module.exports = User
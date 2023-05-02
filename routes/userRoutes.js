const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')
const postRouter = require('./postRoutes')

const router = express.Router()

// Log in / Sign up routes
router.post('/signup', userController.uploadProfilePic, userController.resizeProfilePic, authController.signup)
router.post('/login', authController.login)
router.post('/logout', authController.logout)

// Post routes
router.use('/:id/posts', postRouter)

// Follow routes
router.get('/:followId/follow', authController.protect, userController.follow)
router.get('/:followId/unfollow', authController.protect, userController.unfollow)

router.get('/:id/followers', userController.getFollowers)
router.get('/:id/following', userController.getFollowing)

// Geoqueries
router.get('/near', authController.protect, userController.findUsersInRange)

// General user routes
router.route('/')
 .get(userController.getAllUsers)

router.route('/:handle')
 .get(userController.getUser)

// Util router
router.get('/util/istaken/:handle', userController.checkHandle)

// Search functionality for explore page
router.get('/search/:handle', userController.searchUsers)

module.exports = router
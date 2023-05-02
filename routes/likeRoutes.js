const express = require('express')
const likesController = require('../controllers/likesController')
const authController = require('../controllers/authController')

const router = express.Router({ mergeParams: true })

router.get('/like', authController.protect, likesController.likePost)
router.get('/unlike', authController.protect, likesController.unlikePost)
router.get('/likedPosts', authController.protect, likesController.getLikesPostsByUser)

module.exports = router
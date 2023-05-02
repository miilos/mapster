const express = require('express')
const authController = require('../controllers/authController')
const commentController = require('../controllers/commentController')

const router = express.Router({ mergeParams: true })

router.post('/comment', authController.protect, commentController.commentOnPost)
router.get('/:commentId/like', authController.protect, commentController.likeComment)

module.exports = router
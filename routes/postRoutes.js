const express = require('express')
const authController = require('../controllers/authController')
const postController = require('../controllers/postController')
const likesRouter = require('../routes/likeRoutes')
const commentRouter = require('../routes/commentRoutes')

const router = express.Router({ mergeParams: true })

// getting posts from followed users
router.get('/posts-from-following', authController.protect, postController.getPostsFromFollowing)

// getting posts within 50km of user
router.get('/near', authController.protect, postController.getPostsWithinRange)

// /api/v1/users/:id/posts/post
router.route('/')
 .post(authController.protect, postController.createPost)

router.get('/', postController.getAllPosts)

router.get('/:id', postController.getPost)

// likes
router.use('/:id/likes', likesRouter)

// comments
router.use('/:id/comments', commentRouter)


module.exports = router
const express = require('express')
const viewController = require('../controllers/viewController')

const router = express.Router()

router.get('/', viewController.mainPage)
router.get('/login', viewController.loginPage)
router.get('/signup', viewController.signupPage)
router.get('/home', viewController.homePage)
router.get('/post', viewController.createPostPage)
router.get('/settings', viewController.settingsPage)
router.get('/:postId/comments', viewController.commentsPage)
router.get('/:handle', viewController.profilePage)
router.get('/:postId/likes', viewController.likesPage)
router.get('/:userId/explore', viewController.explorePage)
router.get('/:userId/following', viewController.followingPage)
router.get('/:userId/followers', viewController.followersPage)

module.exports = router
// server/src/routes/auth.routes.js
const router = require('express').Router()
const controller = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

router.post('/register', controller.register)
router.post('/login',    controller.login)
router.post('/refresh',  controller.refresh)
router.get('/me',        authenticate, controller.me)
router.post('/logout',   controller.logout)

module.exports = router

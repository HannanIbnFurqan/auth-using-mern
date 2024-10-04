import express from 'express';
import userController from '../controller/user.controller.js';

const router = express.Router();

// Register route
router.post('/register', userController.register);
// login route
router.post('/login', userController.login);
// logout route
router.get('/logout', userController.logout);

// Route to refresh the access token using the refresh token
router.get('/refresh_token', userController.refreshToken);

export default router;

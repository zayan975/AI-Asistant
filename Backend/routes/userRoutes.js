import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authUser } from "../middleware/authMiddleware.js";
import { body } from "express-validator";

const router = Router();

router.post('/register',
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
    userController.createUserController
);

router.post('/login',
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('password').isLength({ min: 3 }).withMessage('Password must be at least 3 characters long'),
    userController.loginController
);

router.get('/logout', authUser, userController.logoutController);

router.get('/profile', authUser, userController.profileController);

router.get('/all',authUser, userController.getAllUsersController);

export default router;

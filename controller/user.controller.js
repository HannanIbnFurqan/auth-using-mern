import jwt from 'jsonwebtoken';
import User from '../model/userModel.js'
import bcrypt from 'bcrypt'
const userController = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            console.log(name,email,password)
            // Validate that all fields are provided
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'All fields are required' });
            }

            // Check if the user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'User already exists' });
            }

            // Hash the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create a new user
            const newUser = new User({
                name,
                email,
                password: hashedPassword
            });

            // Save the user to the database
            await newUser.save();

            // Generate tokens
            const accessToken = createAccessToken({ id: newUser._id });
            const refreshToken = createRefreshToken({ id: newUser._id });

            // Store refresh token in HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            // Respond with access token
            return res.status(201).json({ success: true, accessToken });

        } catch (error) {
            console.error('Error during registration:', error);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    refreshToken: async (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken;
            if (!rf_token) {
                return res.status(400).json({ success: false, message: 'Please Login or Register' });
            }

            jwt.verify(rf_token, process.env.REFRESH_TOKEN, (err, user) => {
                if (err) return res.status(400).json({ success: false, message: 'Invalid refresh token, please login again' });

                // Generate a new access token
                const accessToken = createAccessToken({ id: user.id });

                return res.json({ success: true, accessToken });
            });
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    },

    // create login functionality

    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("login", email, password);
    
            // Check if user exists
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
    
            // Compare the password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
    
            // Optionally generate a JWT token if you're using JWT for authentication
            const accessToken = createAccessToken({ id: user._id });
            const refreshToken = createRefreshToken({ id: user._id });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });
    
            // Send a success response with the access token
            res.status(200).json({
                message: 'Login successful',
                accessToken,
            });
    
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },
    logout: async (req, res) => {
        try {
            // Clear the refresh token cookie
            res.clearCookie('refreshToken', { path: '/user/refresh_token' });
    
            return res.status(200).json({ message: "Logged out successfully" });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    getUser: async (req,res)=>{
        try {
            const user = await User.findById(req.user.id).select('-password')
            if(!user) return res.status(400).json({message: "User Not Found"})
            res.json(user)
        } catch (error) {
            res.status(500).json({err: error.message})
        }
    }
    
    
};

// Functions to generate access and refresh tokens

const createAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const createRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.REFRESH_TOKEN, { expiresIn: '7d' });
};

export default userController;

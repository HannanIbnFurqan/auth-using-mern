import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import router from './routes/userRoute.js';
import connectDB from './connectionDB/connectDB.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());  // Enable cookie parsing

const PORT = process.env.PORT || 8000;

app.use('/user', router);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectDB();
});

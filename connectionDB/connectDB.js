import mongoose from "mongoose"
import dotenv from 'dotenv'
dotenv.config()
const connectDB = async () =>{
  try {
    const dbURL = process.env.DB_URI
    await mongoose.connect(dbURL)
    console.log('connection successfully')
  } catch (error) {
    console.log(error)
  }
}

export default connectDB
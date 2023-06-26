import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './mongodb/connect.js'
import userRouter from './routes/user.routes.js';
import propertyRouter from './routes/property.routes.js';
dotenv.config()
const app=express();

app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
    origin:"*",
    credentials: true,
}))
app.use('/api/v1/users', userRouter);
app.use('/api/v1/properties', propertyRouter);

app.get('/',(req,res)=>{
    res.send({message:"Hello World"})
})
const startServer=async()=>{
    try {
        connectDB(process.env.MONGODB_URL);
        app.listen(8080,()=>{
            console.log('Server Running on http://localhost:8080')
        })
    } catch (error) {
        console.log(error)
    }
}
startServer();
import express from 'express';
import morgan from 'morgan';
import connectDB from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import cookieParser from 'cookie-parser';
import projectRoutes from './routes/projectRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import cors from 'cors';


connectDB();

const app = express();

app.use(cors({
     origin: "http://localhost:5173",
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/users', userRoutes);
app.use('/projects',projectRoutes);
app.use('/ai',aiRoutes)

app.get('/',(req,res) => {
    res.send('Hello, World!');
})

export default app;
import express from 'express'
import { dbconnection } from './db.js';
import dotenv from 'dotenv'


const app = express();

dotenv.config({path:"./.env"})

const PORT = process.env.PORT || 4000;


dbconnection(); 

app.listen(PORT , ()=>{
    console.log(`Server Listen On PORT ${PORT}`);
    
})
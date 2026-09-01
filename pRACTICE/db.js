import mongoose from "mongoose";


export const dbconnection = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI , 
            {
                dbName:"Demo"
            }
           
            
        )
         console.log("database connected");
    } catch (error) {
        
    }
}

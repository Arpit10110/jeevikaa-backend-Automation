import mongoose from 'mongoose';

export const medicine_DB = () => {
    mongoose.connect(process.env.MongodB_Url,{dbName:"medicine"}).then(()=>{
        console.log("Medicine Database connected successfully");
    }).catch((e)=>{
        console.error("Database connection failed:");
    })
}
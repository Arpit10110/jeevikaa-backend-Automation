import mongoose from 'mongoose';

export const jeevikaa_DB = () => {
    mongoose.connect(process.env.MongodB_Url,{dbName:"jeevikaa"}).then(()=>{
        console.log("Jeevika Database connected successfully");
    }).catch((e)=>{
        console.error("Database connection failed:");
    })
}
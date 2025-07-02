import express from 'express';
const medrouter = express.Router();

// testing router
medrouter.get("/medrouter/test",(req,res)=>{
  try {
    return(
        res.json({
            message: "Med Router is working"
        })
    )
  } catch (error) {
    return(
        res.json({
            message: "Med Router is not working",
            error: error.message
        })
    )
  }
})

export default medrouter;
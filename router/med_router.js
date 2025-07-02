import express from 'express';
import { getallMedicines } from '../controller/med_controller.js';
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

//get all medicine
medrouter.get("/medrouter/getallmedicines",getallMedicines);

export default medrouter;
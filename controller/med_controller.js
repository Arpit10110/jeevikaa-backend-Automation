import { MedModel } from "../model/medmodel.js";


export const getallMedicines = async(req,res)=>{
    try {
        // fetching first 12 medicines
        const all_med = await MedModel.find({}).limit(12);
        return res.json({
            message: "All medicines fetched successfully",
            data: all_med
        })
        
    } catch (error) {
        return(
            res.json({
                message: "Error in getting all medicines",
                error: error.message
            })
        )
    }
} 
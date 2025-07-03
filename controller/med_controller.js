import { MedModel } from "../model/medmodel.js";


export const getallMedicines = async(req,res)=>{
    try {
        const {page} = await req.body;
        
        const limit = 12;
        const skip = (page - 1) * limit;

        const all_med = await MedModel.find({}).skip(skip).limit(limit);
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
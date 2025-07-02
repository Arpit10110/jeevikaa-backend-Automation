import app from "./app.js";
import { jeevikaa_DB } from "./db/db.js";
import { medicine_DB } from "./db/med_db.js";
app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})
jeevikaa_DB();
medicine_DB();
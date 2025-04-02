const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
            JOIN public.classification AS c 
            ON i.classification_id = c.classification_id 
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}


/* ***************************
 *  Get inventory item by inventory_id
 * ************************** */
async function getInventoryItemByInventoryId(inventory_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory WHERE inv_id = $1`,
            [inventory_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getinventorybyid error " + error)
    }
}

/* ***************************
 *  Add new classification
 * ************************** */
async function insertClassification(classification_name) {
    try {
        const data = await pool.query(
            `INSERT INTO public.classification (classification_name) VALUES ($1)`,
            [classification_name]
        )
        return data
    } catch (error) {
        console.error("insertclassification error " + error)
    }
}

/* **********************
 *   Check for existing classification
 * ********************* */
async function checkExistingClassification(classification_name){
    try {
        const sql = "SELECT * FROM public.classification WHERE classification_name = $1"
        const classification = await pool.query(sql, [classification_name])
        return classification.rowCount
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Add new inventory item
 * ************************** */
async function insertInventory(inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id) {
    try {
        const data = await pool.query(
            "INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
            [inv_make, inv_model, inv_year, inv_description, "/images/vehicles/no-image.png", "/images/vehicles/no-image-tn.png", inv_price, inv_miles, inv_color, classification_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("inventory error " + error)
    }
}

/* ***************************
 *  Update inventory item
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id) {
    try {
        const data = await pool.query(
            "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, inv_price = $5, inv_miles = $6, inv_color = $7, classification_id = $8 WHERE inv_id = $9 RETURNING *",
            [inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("updateinventory error " + error)
    }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryItemByInventoryId, insertClassification, checkExistingClassification, insertInventory, updateInventory};
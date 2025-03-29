const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
 *  Add Classification Validation Rules
 *  ********************************* */
validate.classificationRules = () => {
    return [
        // classification_name is required, must be string, and not already exist in DB
        body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .isAlphanumeric()
        .withMessage("Please provide a valid classification name.") // on error this message is sent.
        .custom(async (classification_name) => {
            const classificationExists = await invModel.checkExistingClassification(classification_name)
            if (classificationExists) {
                throw new Error("Classification exists. Please use a different name")
            }
        }),
    ]
}

/* ******************************
 * Check data and return errors or continue to adding classification
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors,
            title: "Add Classification",
            nav,
            classification_name,
        })
        return
    }
    next()
}

/*  **********************************
 *  Add Inventory Validation Rules
 *  ********************************* */
validate.inventoryRules = () => {
    return [
        body('inv_make')
        .trim()
        .escape()
        .notEmpty().withMessage('Make is required')
        .isLength({ max: 30 }).withMessage('Make must be less than 30 characters'),

        body('inv_model')
        .trim()
        .escape()
        .notEmpty().withMessage('Model is required')
        .isLength({ max: 30 }).withMessage('Model must be less than 30 characters'),

        body('inv_year')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
        .withMessage(`Year must be between 1900 and ${new Date().getFullYear() + 1}`),

        body('inv_description')
        .trim()
        .escape()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

        body('inv_price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0 }).withMessage('Price must be a positive number')
        .custom((value) => {
            const decimalPlaces = value.toString().split('.')[1]?.length || 0;
            if (decimalPlaces > 2) {
            throw new Error('Price cannot have more than 2 decimal places');
            }
            return true;
        }),

        body('inv_miles')
        .notEmpty().withMessage('Mileage is required')
        .isInt({ min: 0 }).withMessage('Mileage must be a positive integer'),

        body('inv_color')
        .trim()
        .escape()
        .notEmpty().withMessage('Color is required')
        .isLength({ max: 20 }).withMessage('Color must be less than 20 characters')
        .matches(/^[a-zA-Z\s-]*$/).withMessage('Color must contain only letters, spaces, and hyphens'),

        body('classification_id')
        .notEmpty().withMessage("Classification is required")
        .isInt({ min: 1 }).withMessage("Classification id must be positive"),
    ]
}

/* ******************************
 * Check data and return errors or continue to adding inventory
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classifications = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classifications,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
        })
        return
    }
    next()
}

module.exports = validate;
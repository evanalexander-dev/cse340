// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')
const invController = require("../controllers/invController")


// Route to build management view
router.get("/", utilities.handleErrors(invController.buildManagement));
// Route to build add classification view
router.get("/manage/add-classification", utilities.handleErrors(invController.buildAddClassification));
// Route to process add classification form
router.post(
    "/manage/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
// Route to build add inventory view
router.get("/manage/add-inventory", utilities.handleErrors(invController.buildAddInventory));
// Route to process add inventory form
router.post(
    "/manage/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to get inventory item by inventory id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

module.exports = router;
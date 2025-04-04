// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const invValidate = require('../utilities/inventory-validation')
const invController = require("../controllers/invController")


// Route to build management view
router.get("/", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildManagement));
// Route to handle getting inventory as json
router.get("/getInventory/:classification_id", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.getInventoryJSON));
// Route to build edit inventory view
router.get("/edit/:inventory_id", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildEditInventory));
// Route to process update inventory form
router.post(
    "/update/",
    utilities.checkEmployeeAdmin,
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);
// Route to build add classification view
router.get("/manage/add-classification", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildAddClassification));
// Route to process add classification form
router.post(
    "/manage/add-classification",
    utilities.checkEmployeeAdmin,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)
// Route to build add inventory view
router.get("/manage/add-inventory", utilities.checkEmployeeAdmin, utilities.handleErrors(invController.buildAddInventory));
// Route to process add inventory form
router.post(
    "/manage/add-inventory",
    utilities.checkEmployeeAdmin,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)
// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to get inventory item by inventory id
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId));

module.exports = router;
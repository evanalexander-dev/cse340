const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const regValidate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")


// Route to build default view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildDefault))
// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))
// Route to build the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Route to process the registration form
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Route to process the login form
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;
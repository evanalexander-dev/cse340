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
// Route to deliver the account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate))
// Route to process the account update
router.post(
    "/update",
    utilities.checkLogin,
    regValidate.accountUpdateRules(),
    regValidate.checkAccountData,
    utilities.handleErrors(accountController.updateAccount)
)
// Route to process the password update
router.post(
    "/update/password",
    utilities.checkLogin,
    regValidate.passwordRules(),
    regValidate.checkPasswordData,
    utilities.handleErrors(accountController.updatePassword)
)
// Route to process logout
router.get("/logout", utilities.handleErrors(accountController.logoutAccount))

module.exports = router;
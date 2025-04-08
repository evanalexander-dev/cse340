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
// Route to deliver the account management view
router.get("/manage", utilities.checkAdmin, utilities.handleErrors(accountController.buildManagement))
// Route to deliver the account update admin view
router.get("/manage/update/:account_id", utilities.checkLogin, utilities.checkAdmin, utilities.handleErrors(accountController.buildAccountUpdateAdmin))
// Route to process the account update admin
router.post(
    "/manage/update",
    utilities.checkLogin,
    utilities.checkAdmin,
    regValidate.accountUpdateRules(),
    regValidate.checkAccountData,
    utilities.handleErrors(accountController.updateAccountAdmin)
)
// Route to process the password update admin
router.post(
    "/manage/update/password",
    utilities.checkLogin,
    utilities.checkAdmin,
    regValidate.passwordRules(),
    regValidate.checkPasswordData,
    utilities.handleErrors(accountController.updatePasswordAdmin)
)
// Route to deliver the delete account confirmation view
router.get("/manage/delete/:account_id", utilities.checkAdmin, utilities.handleErrors(accountController.buildDeleteConfirmation))
// Route to process the deletion
router.post("/manage/delete", utilities.checkAdmin, utilities.handleErrors(accountController.deleteAccount))


module.exports = router;
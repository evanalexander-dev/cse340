const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver default view
* *************************************** */
async function buildDefault(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/default", {
    title: "Account",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_emai
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return req.session.save(() => {res.redirect("/account/")})
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
*  Deliver account update view
* *************************************** */
async function buildAccountUpdate(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id
  })
}

/* ****************************************
*  Process account update
* *************************************** */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  let updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  )

  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  let account_types = await utilities.buildAccountTypeList(accountData.account_type)

  if (updateResult) {
    delete accountData.account_password
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
    if(process.env.NODE_ENV === 'development') {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    req.flash("notice", "Account information updated successfully")
    req.session.save(() => {res.redirect("/account/")})
  } else {
    req.flash("notice", "Failed to update account information")
    res.status(501).render("account/update", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      account_types
    })
  }
}

/* ****************************************
*  Process password update
* *************************************** */
async function updatePassword(req, res) {
  const { account_password, account_id } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    req.session.save(() => {res.status(500).redirect("/account/")})
    return
  }

  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  )

  if (updateResult) {
    req.flash("notice", "Password updated successfully")
    req.session.save(() => {res.redirect("/account/")})
  } else {
    req.flash("notice", "Failed to update password")
    req.session.save(() => {res.status(501).redirect(`/account/update/${account_id}`)})
  }
}

/* ****************************************
*  Deliver account update admin view
* *************************************** */
async function buildAccountUpdateAdmin(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  const accountData = await accountModel.getAccountById(account_id)
  const account_types = await utilities.buildAccountTypeList(accountData.account_type)
  let nav = await utilities.getNav()
  res.render("account/update-admin", {
    title: "Update Account",
    nav,
    errors: null,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_id: accountData.account_id,
    account_types
  })
}

/* ****************************************
*  Process account update admin
* *************************************** */
async function updateAccountAdmin(req, res) {
  const { account_firstname, account_lastname, account_email, account_type, account_id } = req.body
  let updateResult = await accountModel.updateAccountAdmin(
    account_firstname,
    account_lastname,
    account_email,
    account_type,
    account_id
  )

  let nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)
  let account_types = await utilities.buildAccountTypeList(accountData.account_type)

  if (updateResult) {
    req.flash("notice", "Account information updated successfully")
    req.session.save(() => {res.redirect("/account/manage")})
  } else {
    req.flash("notice", "Failed to update account information")
    res.status(501).render("account/update-admin", {
      title: "Update Account",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
      account_id,
      account_types
    })
  }
}

/* ****************************************
*  Process password update admin
* *************************************** */
async function updatePasswordAdmin(req, res) {
  const { account_password, account_id } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the password update.')
    req.session.save(() => {res.status(500).redirect("/account/manage")})
    return
  }

  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  )

  if (updateResult) {
    req.flash("notice", "Password updated successfully")
    req.session.save(() => {res.redirect("/account/manage")})
  } else {
    req.flash("notice", "Failed to update password")
    req.session.save(() => {res.status(501).redirect(`/account/manage/update/${account_id}`)})
  }
}

/* ****************************************
*  Process logout
* *************************************** */
async function logoutAccount(req, res) {
  res.clearCookie("jwt")
  req.session.save(() => {res.redirect("/")})
}

/* ***************************
 *  Build account management view
 * ************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  const table = await utilities.buildAccountManagementTable()
  res.render("./account/management", {
    title: "Account Management",
    nav,
    table,
    errors: null,
  })
}

/* ****************************************
*  Build delete confirmation view
* *************************************** */
async function buildDeleteConfirmation(req, res, next) {
  const account_id = parseInt(req.params.account_id)
  let nav = await utilities.getNav()
  let accountData = await accountModel.getAccountById(account_id)
  let fullName = `${accountData.account_firstname} ${accountData.account_lastname}`
  res.render("./account/delete-confirm", {
    title: `Delete ${fullName}`,
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type
  })
}

/* ****************************************
*  Process delete account form
* *************************************** */
async function deleteAccount(req, res) {
  const { account_id } = req.body

  const deleteResult = await accountModel.deleteAccount(account_id)

  if (deleteResult) {
    req.flash(
      "notice",
      `Success! The account was successfully deleted.`
    )
    req.session.save(() => {res.status(201).redirect("/account/manage")})
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    req.session.save(() => {res.status(501).redirect(`/account/delete/${account_id}`)})
  }
}

module.exports = { buildDefault, buildLogin, buildRegister, registerAccount, accountLogin, buildAccountUpdate, updateAccount, updatePassword, buildAccountUpdateAdmin, updateAccountAdmin, updatePasswordAdmin, logoutAccount, buildManagement, buildDeleteConfirmation, deleteAccount }
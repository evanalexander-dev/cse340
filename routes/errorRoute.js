// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const errorController = require("../controllers/errorController")

router.get("/throw", utilities.handleErrors(errorController.throwError));

module.exports = router;
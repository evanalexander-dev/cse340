const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item view by inventory id
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inventory_id = req.params.inventoryId
  const data = await invModel.getInventoryItemByInventoryId(inventory_id)
  const card = await utilities.buildInventoryDetailCard(data)
  let nav = await utilities.getNav()
  const vehicle = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
  res.render("./inventory/detail", {
    title: vehicle,
    nav,
    card,
  })
}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classifications = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classifications,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process add classification form
* *************************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body

  const insertResult = await invModel.insertClassification(
    classification_name
  )

  let nav = await utilities.getNav()

  if (insertResult) {
    req.flash(
      "notice",
      `Success! ${classification_name} created.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Creation of new classification failed.")
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null
    })
  }
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classifications = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classifications,
    errors: null,
  })
}

/* ****************************************
*  Process add inventory form
* *************************************** */
invCont.addInventory = async function (req, res) {
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body

  const insertResult = await invModel.insertInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  let nav = await utilities.getNav()

  if (insertResult) {
    const classifications = await utilities.buildClassificationList()
    req.flash(
      "notice",
      `Success! ${inv_year} ${inv_make} ${inv_model} created.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classifications,
      errors: null
    })
  } else {
    let classifications = await utilities.buildClassificationList(classification_id)
    req.flash("notice", "Creation of new inventory failed.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classifications,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  let itemData = await invModel.getInventoryItemByInventoryId(inventory_id)
  let classifications = await utilities.buildClassificationList(itemData.classification_id)
  let itemName = `${itemData.inv_year} ${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {

    title: `Edit ${itemName}`,
    nav,
    classifications,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ****************************************
*  Process update inventory form
* *************************************** */
invCont.updateInventory = async function (req, res) {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  let nav = await utilities.getNav()

  if (updateResult) {
    const itemName = `${updateResult.inv_year} ${updateResult.inv_make} ${updateResult.inv_model}`
    const classifications = await utilities.buildClassificationList()
    req.flash(
      "notice",
      `Success! The ${itemName} was successfully updated.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classifications,
      errors: null
    })
  } else {
    const classifications = await utilities.buildClassificationList(classification_id)
    const itemName = `${updateResult.inv_year} ${updateResult.inv_make} ${updateResult.inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: `Edit ${itemName}`,
      nav,
      classifications,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ****************************************
*  Build delete confirmation view
* *************************************** */
invCont.buildDeleteConfirmation = async function (req, res, next) {
  const inventory_id = parseInt(req.params.inventory_id)
  let nav = await utilities.getNav()
  let itemData = await invModel.getInventoryItemByInventoryId(inventory_id)
  let itemName = `${itemData.inv_year} ${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

/* ****************************************
*  Process delete inventory form
* *************************************** */
invCont.deleteInventoryItem = async function (req, res) {
  const { inv_id } = req.body

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  let nav = await utilities.getNav()

  if (deleteResult) {
    const classifications = await utilities.buildClassificationList()
    req.flash(
      "notice",
      `Success! The inventory item was successfully deleted.`
    )
    res.status(201).render("inventory/management", {
      title: "Inventory Management",
      nav,
      classifications,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    req.session.save(() => {res.status(501).redirect(`/inv/delete/${inv_id}`)})
  }
}

module.exports = invCont;
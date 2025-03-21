const errorCont = {}

errorCont.throwError = async function (req, res, next) {
    throw new Error("Intentional error!")
}

module.exports = errorCont;
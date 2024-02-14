const express = require("express");
const routerController = require("../controller/google")
const router = express.Router();

router.get("/download", routerController.downloadFile);
router.get("/progress", routerController.progess);

module.exports = router;
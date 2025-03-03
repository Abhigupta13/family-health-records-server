const express =require('express');
const { PrescriptionAnalysisController } =require('./../controllers/ocr.controller')

const router=express.Router();
const multer = require("multer");

const upload = multer({ dest: "uploads/" }); // Store uploaded images in 'uploads' folder


router.post('/extract-text',upload.single("file"),PrescriptionAnalysisController)

module.exports=router;
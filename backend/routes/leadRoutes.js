const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createLead, getLeads, bulkUpload, downloadTemplate, getAgents, assignLeads,updateLead, deleteLead,deleteLeadsBulk} = require("../controllers/leadController");
const authMiddleware = require("../Middleware/authMiddleware");

// Memory Storage for Excel Processing
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post("/", authMiddleware, createLead);
router.get("/", authMiddleware, getLeads);
router.post("/upload", authMiddleware, upload.single("file"), bulkUpload);

router.get("/agents", authMiddleware, getAgents); 
router.put("/assign", authMiddleware, assignLeads); 

router.delete("/bulk-delete", authMiddleware, deleteLeadsBulk); 
router.delete("/:id", authMiddleware, deleteLead); 

router.get("/template", authMiddleware, downloadTemplate);

router.put("/:id", authMiddleware, updateLead);

module.exports = router;
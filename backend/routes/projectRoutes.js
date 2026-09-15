const express = require("express");
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject } = require("../controllers/projectController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { idParams, createProjectBody, updateProjectBody } = require("../schemas/project");

router.get("/", getProjects);
router.get("/:id", validate(idParams, "params"), getProject);
router.post("/", protect, adminOnly, validate(createProjectBody), createProject);
router.put("/:id", protect, adminOnly, validate(idParams, "params"), validate(updateProjectBody), updateProject);
router.delete("/:id", protect, adminOnly, validate(idParams, "params"), deleteProject);

module.exports = router;
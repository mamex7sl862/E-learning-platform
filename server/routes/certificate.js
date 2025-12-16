// server/routes/certificate.js
const express = require("express");
const path = require("path");
const PDFDocument = require("pdfkit");
const auth = require("../middleware/authMiddleware");
const Course = require("../models/course");

const router = express.Router();

router.get("/:courseId", auth(), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 0,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${course.title}_Certificate.pdf"`
    );

    doc.pipe(res);

    // ================= IMAGES =================
    const publicDir = path.join(__dirname, "../public");

    // Background
    const bgPath = path.join(publicDir, "bg.png");
    if (require("fs").existsSync(bgPath))
      doc.image(bgPath, 0, 0, { width: 842, height: 595 });

    // Logo
    const logoPath = path.join(publicDir, "logo.png");
    if (require("fs").existsSync(logoPath))
      doc.image(logoPath, 60, 40, { width: 120 });

    // Title
    doc
      .font("Helvetica-Bold")
      .fontSize(36)
      .fillColor("#1f2937")
      .text("Certificate of Completion", 0, 140, { align: "center" });

    // Student name
    doc
      .moveDown(1)
      .fontSize(30)
      .fillColor("#111827")
      .text(req.user.name || "Student", { align: "center" });

    // Body text
    doc
      .moveDown(0.5)
      .fontSize(18)
      .fillColor("#374151")
      .text("has successfully completed the course", { align: "center" });

    // Course title
    doc
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .fontSize(24)
      .fillColor("#111827")
      .text(course.title, { align: "center" });

    // Date
    doc
      .moveDown(1.5)
      .font("Helvetica")
      .fontSize(16)
      .text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });

    // Signature
    const signPath = path.join(publicDir, "signature.png");
    if (require("fs").existsSync(signPath))
      doc.image(signPath, 200, 420, { width: 180 });
    doc
      .fontSize(14)
      .text("Instructor Signature", 200, 510, { width: 180, align: "center" });

    // Seal
    const sealPath = path.join(publicDir, "seal.png");
    if (require("fs").existsSync(sealPath))
      doc.image(sealPath, 580, 410, { width: 120 });

    // Footer
    doc
      .fontSize(12)
      .fillColor("#4b5563")
      .text("E-Learning Platform", 0, 560, { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Certificate generation error:", err);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
});

module.exports = router;

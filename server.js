const open = (...args) => import('open').then(({default: open}) => open(...args));
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3100;

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public")); // ✅ serve admin.html and other frontend files

// CREATE UPLOADS FOLDER IF NOT EXISTS
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// MULTER STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// ROUTES

// Test route
app.get("/", (req, res) => res.send("Backend is running successfully!"));

// POST /report
app.post("/report", upload.single("photo"), (req, res) => {
  const { location, description, latitude, longitude } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  if (!description || description.trim() === "")
    return res.status(400).json({ message: "Description is required" });

  const report = {
    location: location || "Auto Location",
    description,
    latitude,
    longitude,
    image: imagePath,
    timestamp: new Date().toISOString(),
  };

  const filePath = path.join(__dirname, "reports.json");

  let reports = [];
  if (fs.existsSync(filePath)) {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      reports = data ? JSON.parse(data) : [];
    } catch {
      reports = [];
    }
  }

  reports.push(report);
  fs.writeFileSync(filePath, JSON.stringify(reports, null, 2));

  res.json({ message: "Report submitted successfully!", report });
});

// GET all reports for admin dashboard
app.get("/reports", (req, res) => {
  const filePath = path.join(__dirname, "reports.json");
  if (!fs.existsSync(filePath)) return res.json([]);

  try {
    const data = fs.readFileSync(filePath, "utf8");
    const reports = data ? JSON.parse(data) : [];
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to read reports" });
  }
});
app.delete("/reports/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const filePath = path.join(__dirname, "reports.json");

  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "No reports found" });

  try {
    const data = fs.readFileSync(filePath, "utf8");
    let reports = data ? JSON.parse(data) : [];

    if (index < 0 || index >= reports.length) {
      return res.status(400).json({ message: "Invalid report index" });
    }

    reports.splice(index, 1); // remove the report
    fs.writeFileSync(filePath, JSON.stringify(reports, null, 2));

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete report" });
  }
});


// START SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  open(`http://localhost:${PORT}/admin.html`);
});


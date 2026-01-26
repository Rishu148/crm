const Lead = require("../models/lead");
const User = require("../models/user"); // Agent list ke liye zaroori
const xlsx = require("xlsx");

// --- HELPER FUNCTION: Assignee Decide Karne Ke Liye ---
// Agar Admin hai to 'null' (Unassigned), agar User hai to 'Self'
const getAssignee = (user) => {
  if (user.role === 'admin') {
    return null; // Admin create karega to Unassigned rahegi
  }
  return user.id; // Agent create karega to ussi ki hogi
};

// 1. CREATE LEAD (Manual)
exports.createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status } = req.body;

    const existingLead = await Lead.findOne({ phone });
    if (existingLead) {
      return res.status(400).json({ message: "Lead with this phone already exists" });
    }

    const newLead = await Lead.create({
      name,
      email,
      phone,
      source,
      status,
      // 👇 SMART LOGIC: Admin = Unassigned, Agent = Self
      assignedTo: getAssignee(req.user), 
      createdBy: req.user.id,
    });

    res.status(201).json(newLead);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. GET LEADS
exports.getLeads = async (req, res) => {
  try {
    let query = {};
    
    // Agar Agent hai, to sirf apni leads dekhega
    if (req.user.role !== "admin") {
      query = { assignedTo: req.user.id };
    }
    // Note: Admin ko sab dikhega (Unassigned + Assigned)

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email") // User ka data (Naam) laane ke liye
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. BULK UPLOAD (Excel)
exports.bulkUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const leadsToInsert = [];
    const duplicates = [];

    // 👇 Decide karo saari leads kisko milengi (Admin = Unassigned)
    const assignee = getAssignee(req.user);

    for (const row of rawData) {
      // Case insensitive column matching
      const phone = row.Phone || row.phone || row.Mobile || row.mobile;
      const name = row.Name || row.name || row["Full Name"];
      
      if (phone && name) {
        const exists = await Lead.findOne({ phone: String(phone) });

        if (!exists) {
          leadsToInsert.push({
            name: name,
            phone: String(phone),
            email: row.Email || row.email || "",
            source: row.Source || row.source || "Bulk Upload", 
            status: row.Status || row.status || "New",
            assignedTo: assignee, // 👈 Logic applied here
            createdBy: req.user.id,
          });
        } else {
          duplicates.push(phone);
        }
      }
    }

    if (leadsToInsert.length > 0) {
      await Lead.insertMany(leadsToInsert);
    }

    res.status(200).json({
      message: "Upload Processed",
      added: leadsToInsert.length,
      skipped: duplicates.length,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error during upload" });
  }
};

// 4. DOWNLOAD TEMPLATE
exports.downloadTemplate = async (req, res) => {
    try {
        const data = [
            { Name: "Amit Kumar", Phone: "9999999999", Email: "amit@test.com", Source: "Facebook", Status: "New" },
            { Name: "Priya Sharma", Phone: "8888888888", Email: "priya@gmail.com", Source: "Website", Status: "Interested" },
        ];

        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Leads Template");

        const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

        res.setHeader("Content-Disposition", 'attachment; filename="CRM_Leads_Template.xlsx"');
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    } catch (error) {
        res.status(500).json({ message: "Could not generate template" });
    }
};

// 5. GET AGENTS (For Admin Dropdown)
exports.getAgents = async (req, res) => {
  try {
    // Sirf 'user' role walon ko dhundo
    const agents = await User.find({ role: "user" }).select("name email");
    res.json(agents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching agents" });
  }
};

// 6. ASSIGN LEADS (Admin Action)
exports.assignLeads = async (req, res) => {
  try {
    const { leadIds, assignedTo } = req.body;

    if (!leadIds || leadIds.length === 0 || !assignedTo) {
      return res.status(400).json({ message: "Please select leads and an agent." });
    }

    // Update assignment
    await Lead.updateMany(
      { _id: { $in: leadIds } },
      { $set: { assignedTo: assignedTo } }
    );

    res.json({ message: "Leads assigned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Assignment failed" });
  }
};

exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params; 
    const updates = req.body; 

    const updatedLead = await Lead.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(updatedLead);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};


// 7. DELETE SINGLE LEAD (Ek udaane ke liye)
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    await lead.deleteOne();
    res.json({ message: "Lead removed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 8. BULK DELETE (Ek saath dher saari udaane ke liye) 🚀
exports.deleteLeadsBulk = async (req, res) => {
  try {
    const { leadIds } = req.body; // Frontend se array aayega IDs ka
    
    if (!leadIds || leadIds.length === 0) {
      return res.status(400).json({ message: "No leads selected" });
    }

    await Lead.deleteMany({ _id: { $in: leadIds } });
    res.json({ message: "Selected leads deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
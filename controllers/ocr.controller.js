const Tesseract = require('tesseract.js'); // Import Tesseract.js
const fs = require("fs");

const transformToJSON = (text) => {
    try {
        const lines = text.split("\n").map(line => line.trim()).filter(line => line);

        let jsonData = {
            patient_details: {},
            test_details: {},
            ultrasound_findings: {},
            doctor_details: {},
            impression: "",
            remarks: ""
        };

        lines.forEach(line => {
            if (line.includes("Patient Name")) {
                jsonData.patient_details.name = line.split("Patient Name")[1]?.trim() || "";
            } else if (line.includes("Lab No")) {
                jsonData.patient_details.lab_no = line.split("Lab No")[1]?.trim() || "";
            } else if (line.includes("UHID")) {
                jsonData.patient_details.UHID = line.split("UHID")[1]?.trim() || "";
            } else if (line.includes("Age/Gender")) {
                let parts = line.split("/");
                jsonData.patient_details.age = parts[0]?.split("Age/Gender")[1]?.trim() || "";
                jsonData.patient_details.gender = parts[1]?.trim() || "";
            } else if (line.includes("Referred/Presc. By")) {
                jsonData.patient_details.referred_by = line.split("Referred/Presc. By")[1]?.trim() || "";
            } else if (line.includes("Order Date")) {
                jsonData.test_details.order_date = line.split("Order Date")[1]?.trim() || "";
            } else if (line.includes("Report Date")) {
                jsonData.test_details.report_date = line.split("Report Date")[1]?.trim() || "";
            } else if (line.includes("LIVER:")) {
                jsonData.ultrasound_findings.liver = { details: line.split("LIVER:")[1]?.trim() || "" };
            } else if (line.includes("SPLEEN:")) {
                jsonData.ultrasound_findings.spleen = { details: line.split("SPLEEN:")[1]?.trim() || "" };
            } else if (line.includes("KIDNEYS:")) {
                jsonData.ultrasound_findings.kidneys = { details: line.split("KIDNEYS:")[1]?.trim() || "" };
            } else if (line.includes("PROSTATE:")) {
                jsonData.ultrasound_findings.prostate = { details: line.split("PROSTATE:")[1]?.trim() || "" };
            } else if (line.includes("IMPRESSION:")) {
                jsonData.impression = line.split("IMPRESSION:")[1]?.trim() || "";
            } else if (line.includes("Dr.")) {
                jsonData.doctor_details.name = line.trim();
            } else if (line.includes("MBBS") || line.includes("DNB")) {
                jsonData.doctor_details.qualification = line.trim();
            } else if (line.includes("Reg. No")) {
                jsonData.doctor_details.registration_no = line.split("Reg. No")[1]?.trim() || "";
            } else if (line.includes("Note:")) {
                jsonData.remarks = line.split("Note:")[1]?.trim() || "";
            }
        });

        return jsonData;
    } catch (error) {
        console.error("Error in transforming text to JSON:", error);
        return { error: "Failed to transform text to JSON." };
    }
};

const PrescriptionAnalysisController = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
    }

    const imagePath = req.file.path;

    // Use Tesseract.js to extract text
    Tesseract.recognize(
        imagePath,
        'eng', // Specify the language
        {
            logger: info => console.log(info) // Optional: log progress
        }
    ).then(({ data: { text } }) => {
        fs.unlinkSync(imagePath); // Delete the uploaded image after processing
        const jsonResult = transformToJSON(text.trim());
        res.json(jsonResult);
    }).catch(err => {
        console.error(`Tesseract Error: ${err}`);
        res.status(500).json({ error: "Error processing image" });
    });
};

module.exports = { PrescriptionAnalysisController };

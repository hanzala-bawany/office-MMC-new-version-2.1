import { useState, useEffect } from "react";
import { Button, Spin, Checkbox, Tabs, Divider, Tag, Alert, Badge } from "antd";
import {
    BulbOutlined,
    CloseOutlined,
    MedicineBoxOutlined,
    ExperimentOutlined,
    WarningOutlined,
    HomeOutlined,
    ReloadOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { formatHeight } from "../../utills/formatHeight";

const AiAssistant = ({ complaint, primaryDiagnosis, onAddTests, onAddMedicines, onAddMedicinePlan, onAddTreatment, visible, onClose, currentPatient, currentVitals, aiResponse, setAiResponse, aiVitalAlerts, setAiVitalAlerts }) => {

    // console.log(complaint, "... complaint");
    // console.log(primaryDiagnosis, "... primaryDiagnosis");
    // console.log(currentVitals, "................ currentVitals in AI prompt");
    // console.log(currentPatient, "................ currentPatient in AI prompt");

    const [loading, setLoading] = useState(false);
    const [selectedBasicTests, setSelectedBasicTests] = useState([]);
    const [selectedRecommendedTests, setSelectedRecommendedTests] = useState([]);
    const [selectedMedicines, setSelectedMedicines] = useState([]);
    const [usingGemini, setUsingGemini] = useState(false);

    // ==================== use effects ====================

    // ✅ Sirf pehli dafa fetch karo (ya jab aiResponse null ho)
    useEffect(() => {
        if (visible && !aiResponse && !loading) {
            const alerts = analyzeVitals(currentVitals);
            setAiVitalAlerts(alerts);
            fetchAISuggestion();
        }
    }, [visible]);

    // ✅ Reset selections jab modal close ho
    useEffect(() => {
        if (!visible) {
            setSelectedBasicTests([]);
            setSelectedRecommendedTests([]);
            setSelectedMedicines([]);
        }
    }, [visible]);


    // ==================== GEMINI API ====================
    const fetchGeminiSuggestion = async (complaintText, diagnosisList, vitals) => {

        console.log("fetchGeminiSuggestion  chala he");

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key not found");

        const vitalsText = vitals ? `Blood Pressure: ${vitals.bloodPressure || "N/A"}, Blood Sugar: ${vitals.bloodSugar || "N/A"}, Temperature: ${vitals.temperature || "N/A"}, Pulse: ${vitals.pulse || "N/A"}, Weight: ${vitals.weight || "N/A"}, Height: ${formatHeight(vitals.height) || "N/A"}` : "Not available";

        //         const prompt = `You are a medical assistant for a Pakistani government/private hospital OPD. 
        // Patient info:
        // - Primary Complain : ${complaintText || "Not provided"}
        // - Primary Diagnosis: ${Array.isArray(diagnosisList) ? diagnosisList.join(", ") : diagnosisList || "Not provided"}
        // - Vitals: ${vitalsText}

        // CRITICAL INSTRUCTIONS FOR YOUR RESPONSE:

        // 1. **TREATMENT MUST BE IN ROMAN URDU** (English words likhein lekin Urdu jaisi simple language mein):
        //    Example: "Rozana subah 30 minute walk karein. Pani khoob piyein (8-10 glass). Namak kam karein. 7-8 ghante neend lein."

        // 2. **DIAGNOSIS NAMES** - Har diagnosis ke name ke saath round brackets mein Roman Urdu translation bhi likhein:
        //    Example: "Hypertension (بلڈ پریشر ہائی)" , "Diabetes Mellitus (شوگر کا مرض)", "Viral Fever (وائرل بخار)"

        // 3. **MEDICINES** - Medicine name mein formula/generic name likhein, brand name nahi:
        //    ❌ Brand name: "Panadol", "Augmentin", "Glucophage"
        //    ✅ Formula name: "Paracetamol 500mg", "Co-amoxiclav 625mg", "Metformin 500mg"

        //    Dosage Pakistani practice ke mutabiq likhein.

        // Respond ONLY with this exact JSON (no extra text, no markdown):
        // {
        //   "diagnoses": [
        //     {"name": "Hypertension (بلڈ پریشر ہائی)", "percentage": 70},
        //     {"name": "Diabetes Mellitus (شوگر کا مرض)", "percentage": 20},
        //     {"name": "Viral Fever (وائرل بخار)", "percentage": 10}
        //   ],
        //   "basicTests": ["Test 1", "Test 2", "Test 3"],
        //   "recommendedTests": ["Test 1", "Test 2"],
        //   "medicines": [
        //     {"name": "Paracetamol 500mg", "dosage": "1 tablet jab bhi bukhar ho (every 6 hours)", "duration": "3 days"},
        //     {"name": "Metformin 500mg", "dosage": "1 tablet khane ke baad (twice daily)", "duration": "30 days"}
        //   ],
        //   "treatment": "Rozana walk karein. Pani piyein. Namak kam karein. (Roman Urdu mein likhein)"
        // }`;

        const prompt = `You are a medical assistant for a Pakistani government/private hospital OPD. 

Patient info:
- Age: ${vitals?.AGE || "Not provided"} years
- Gender: ${currentPatient?.GENDER || "Not provided"}
- Primary Complain: ${complaintText || "Not provided"}
- Primary Diagnosis: ${Array.isArray(diagnosisList) ? diagnosisList.join(", ") : diagnosisList || "Not provided"}
- Vitals: BP ${vitals?.bloodPressure || "N/A"}, Sugar ${vitals?.bloodSugar || "N/A"} mg/dL, Temp ${vitals?.temperature || "N/A"}°F, Pulse ${vitals?.pulse || "N/A"} bpm, Weight ${vitals?.weight || "N/A"} kg, Height ${formatHeight(vitals?.height) || "N/A"}

CRITICAL INSTRUCTIONS FOR YOUR RESPONSE:

1. **TREATMENT MUST BE IN ROMAN URDU** (Simple language that Pakistani patients understand):
   Example: "Rozana subah 30 minute walk karein. Pani khoob piyein (8-10 glass). Namak kam karein. 7-8 ghante neend lein."

2. **DIAGNOSIS NAMES** - Write in English with Roman Urdu translation in brackets:
   Example: "Hypertension (بلڈ پریشر ہائی)", "Diabetes Mellitus (شوگر کا مرض)", "Viral Fever (وائرل بخار)"

3. **MEDICINES** - Use generic names only (NO brand names):
   ❌ Brand: "Panadol", "Augmentin", "Glucophage"
   ✅ Generic: "Paracetamol 500mg", "Co-amoxiclav 625mg", "Metformin 500mg"
   
   Dosage should follow standard Pakistani clinical practice.

4. **AGE CONSIDERATION**:
   - If patient is child (<12 years): Reduce medicine dosages, avoid certain adult drugs
   - If patient is elderly (>60 years): Consider lower starting doses, monitor side effects
   - Adjust treatment recommendations based on age

5. **TESTS** - Recommend age-appropriate diagnostic tests

6. **VITALS ANALYSIS** - Analyze the provided vitals and return alerts array:
   - Each alert: { vital, value, type (critical/high/warning), message, recommendation, severity, requiresAdmission }
   - Check: BP, blood sugar, temperature, pulse for dangerous ranges

7. **ADMISSION DECISION** - Based on vitals and diagnosis:
   - Return: { required (bool), urgency (EMERGENCY/URGENT/OUTPATIENT), reason, department }


   STRICT RULES — MUST FOLLOW:

1. DIAGNOSES: Always give exactly 3 diagnoses. Never 
   give 100% to one. If a vital is abnormal (low pulse, 
   high BP etc.), it must appear as a diagnosis. 
   Percentages must sum to 100.

2. MEDICINES: Do not default to Paracetamol every time. 
   Address each significant finding with appropriate 
   medicine. Max 3-4 medicines total.

3. TREATMENT: Maximum 3 sentences. Plain text only — 
   NO markdown, NO **bold**, NO asterisks, NO bullet 
   points. Write in simple Roman Urdu.



Respond ONLY with this examplae of exact JSON format (no extra text, no markdown):

{
  "diagnoses": [
    {"name": "Diagnosis Name (Roman Urdu Translation)", "percentage": 70},
    {"name": "Diagnosis Name 2 (Translation)", "percentage": 20},
    {"name": "Diagnosis Name 3 (Translation)", "percentage": 10}
  ],
  "basicTests": ["Test Name 1", "Test Name 2", "Test Name 3"],
  "recommendedTests": ["Advanced Test 1", "Advanced Test 2"],
  "medicines": [
    {"name": "Generic Medicine 1", "dosage": "Dosage instructions", "duration": "Duration"},
    {"name": "Generic Medicine 2", "dosage": "Dosage instructions", "duration": "Duration"}
  ],
  "medicinePlan": "Detailed medicine plan: Take Paracetamol 500mg every 6 hours for fever. Complete antibiotic course of 5 days.",
  "treatment": "Roman Urdu treatment advice here. Keep it practical and easy to understand.",
  "vitalAlerts": [
    { "vital": "Blood Pressure", "value": "180/120 mmHg", "type": "critical", 
      "message": "Hypertensive Crisis", "recommendation": "Admit immediately", 
      "severity": "CRITICAL", "requiresAdmission": true }
  ],
  "admissionDecision": {
    "required": true,
    "urgency": "EMERGENCY", 
    "reason": "Critical BP requires immediate admission",
    "department": "Emergency / ICU"
  }
}`;


        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData?.error?.message || "Gemini API failed");
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = text.replace(/```json|```/g, "").trim();
        console.log(JSON.parse(cleaned), "............ response of gemini");
        return JSON.parse(cleaned);
    };

    // ==================== LOCAL FALLBACK ( VITALS ANALYSIS ) ====================
    // const analyzeVitals = (vitals) => {
    //     if (!vitals) return [];
    //     const alerts = [];

    //     if (vitals.bloodPressure) {
    //         const parts = vitals.bloodPressure.toString().split(/[/\s]+/);
    //         if (parts.length >= 2) {
    //             const sys = parseInt(parts[0]);
    //             const dia = parseInt(parts[1]);
    //             if (!isNaN(sys) && !isNaN(dia)) {
    //                 if (sys >= 180 || dia >= 120) {
    //                     alerts.push({ type: "critical", vital: "Blood Pressure", value: `${sys}/${dia} mmHg`, message: "Hypertensive Crisis", recommendation: "Immediate IV antihypertensives. Hospital admission required.", severity: "CRITICAL", requiresAdmission: true });
    //                 } else if (sys >= 160 || dia >= 100) {
    //                     alerts.push({ type: "high", vital: "Blood Pressure", value: `${sys}/${dia} mmHg`, message: "Severe Hypertension", recommendation: "Start/adjust BP medication. Review in 1 week.", severity: "HIGH", requiresAdmission: false });
    //                 } else if (sys >= 140 || dia >= 90) {
    //                     alerts.push({ type: "warning", vital: "Blood Pressure", value: `${sys}/${dia} mmHg`, message: "Elevated BP", recommendation: "Lifestyle changes. Monitor regularly.", severity: "MODERATE", requiresAdmission: false });
    //                 } else if (sys < 90 || dia < 60) {
    //                     alerts.push({ type: "warning", vital: "Blood Pressure", value: `${sys}/${dia} mmHg`, message: "Low BP (Hypotension)", recommendation: "Check hydration, medications.", severity: "MODERATE", requiresAdmission: sys < 80 });
    //                 }
    //             }
    //         }
    //     }

    //     if (vitals.bloodSugar) {
    //         const sugar = parseInt(vitals.bloodSugar);
    //         if (!isNaN(sugar)) {
    //             if (sugar >= 300) alerts.push({ type: "critical", vital: "Blood Sugar", value: `${sugar} mg/dL`, message: "Severe Hyperglycemia (DKA risk)", recommendation: "Insulin therapy now. Check urine ketones.", severity: "CRITICAL", requiresAdmission: true });
    //             else if (sugar >= 200) alerts.push({ type: "high", vital: "Blood Sugar", value: `${sugar} mg/dL`, message: "High Blood Sugar", recommendation: "Adjust diabetes medication. Diet review.", severity: "HIGH", requiresAdmission: false });
    //             else if (sugar < 70) alerts.push({ type: "critical", vital: "Blood Sugar", value: `${sugar} mg/dL`, message: "Hypoglycemia", recommendation: "Give sugar/juice immediately. Recheck in 15 min.", severity: "CRITICAL", requiresAdmission: sugar < 50 });
    //         }
    //     }

    //     if (vitals.temperature) {
    //         const temp = parseFloat(vitals.temperature);
    //         if (!isNaN(temp)) {
    //             if (temp >= 103) alerts.push({ type: "critical", vital: "Temperature", value: `${temp}°F`, message: "Very High Fever", recommendation: "Sepsis workup. Blood cultures. Admit.", severity: "CRITICAL", requiresAdmission: true });
    //             else if (temp >= 101) alerts.push({ type: "high", vital: "Temperature", value: `${temp}°F`, message: "High Fever", recommendation: "CBC, CRP. Check for infection.", severity: "HIGH", requiresAdmission: false });
    //         }
    //     }

    //     if (vitals.pulse) {
    //         const pulse = parseInt(vitals.pulse);
    //         if (!isNaN(pulse)) {
    //             if (pulse >= 140 || pulse < 50) alerts.push({ type: "critical", vital: "Pulse", value: `${pulse} bpm`, message: pulse >= 140 ? "Severe Tachycardia" : "Severe Bradycardia", recommendation: "ECG urgently. Cardiac evaluation.", severity: "CRITICAL", requiresAdmission: true });
    //             else if (pulse >= 120 || pulse < 60) alerts.push({ type: "high", vital: "Pulse", value: `${pulse} bpm`, message: pulse >= 120 ? "Tachycardia" : "Bradycardia", recommendation: "Cardiac evaluation recommended.", severity: "HIGH", requiresAdmission: false });
    //         }
    //     }

    //     return alerts;
    // };

    const analyzeVitals = (vitals, previousVitals = null) => {
        if (!vitals) return [];
        const alerts = [];

        // Get patient age from vitals (if passed)
        const patientAge = vitals?.age ? parseInt(vitals.age) : null;
        const isElderly = patientAge && patientAge >= 65;
        const isChild = patientAge && patientAge <= 12;
        const isPregnant = vitals?.isPregnant || false; // Add this prop if needed

        // ==================== BLOOD PRESSURE ====================
        if (vitals.bloodPressure) {
            const parts = vitals.bloodPressure.toString().split(/[/\s]+/);
            if (parts.length >= 2) {
                const sys = parseInt(parts[0]);
                const dia = parseInt(parts[1]);

                if (!isNaN(sys) && !isNaN(dia)) {
                    // ✅ CRITICAL - Hypertensive Emergency
                    if (sys >= 180 || dia >= 120) {
                        alerts.push({
                            type: "critical",
                            vital: "Blood Pressure",
                            value: `${sys}/${dia} mmHg`,
                            message: "HYPERTENSIVE CRISIS - Emergency",
                            recommendation: "Immediate IV antihypertensives. DO NOT delay. Admit to ICU now.",
                            severity: "CRITICAL",
                            requiresAdmission: true
                        });
                    }
                    // ✅ SEVERE - For elderly, lower threshold
                    else if (sys >= 160 || dia >= 100) {
                        alerts.push({
                            type: "high",
                            vital: "Blood Pressure",
                            value: `${sys}/${dia} mmHg`,
                            message: isElderly ? "Severe Hypertension (Elderly - High Risk)" : "Severe Hypertension",
                            recommendation: isElderly
                                ? "Start BP medication at lower dose. Monitor for dizziness. Review in 3-5 days."
                                : "Start/adjust BP medication. Review in 1 week.",
                            severity: "HIGH",
                            requiresAdmission: false
                        });
                    }
                    // ✅ MODERATE - Elevated BP
                    else if (sys >= 140 || dia >= 90) {
                        alerts.push({
                            type: "warning",
                            vital: "Blood Pressure",
                            value: `${sys}/${dia} mmHg`,
                            message: isElderly ? "Elevated BP (Elderly - Monitor Closely)" : "Elevated Blood Pressure",
                            recommendation: isElderly
                                ? "Lifestyle changes. Monitor BP daily. Review in 1 week."
                                : "Lifestyle changes. Monitor regularly.",
                            severity: "MODERATE",
                            requiresAdmission: false
                        });
                    }
                    // ✅ NEW: LOW BP Detection (Hypotension)
                    else if (sys < 90 || dia < 60) {
                        const isSevereHypotension = sys < 80 || dia < 50;
                        alerts.push({
                            type: isSevereHypotension ? "critical" : "warning",
                            vital: "Blood Pressure",
                            value: `${sys}/${dia} mmHg`,
                            message: isSevereHypotension ? "Severe Hypotension - Shock Risk" : "Low Blood Pressure (Hypotension)",
                            recommendation: isSevereHypotension
                                ? "Immediate IV fluids. Check for bleeding/sepsis. Admit if symptomatic."
                                : "Check hydration status. Review medications. Monitor symptoms.",
                            severity: isSevereHypotension ? "CRITICAL" : "MODERATE",
                            requiresAdmission: isSevereHypotension
                        });
                    }
                }
            }
        }

        // ==================== BLOOD SUGAR ====================
        if (vitals.bloodSugar) {
            const sugar = parseInt(vitals.bloodSugar);
            if (!isNaN(sugar)) {
                // ✅ CRITICAL - DKA Risk
                if (sugar >= 300) {
                    alerts.push({
                        type: "critical",
                        vital: "Blood Sugar",
                        value: `${sugar} mg/dL`,
                        message: "SEVERE HYPERGLYCEMIA - DKA Risk",
                        recommendation: "Check urine ketones. Start insulin. Admit if ketones positive or patient is sick.",
                        severity: "CRITICAL",
                        requiresAdmission: true
                    });
                }
                // ✅ HIGH - Uncontrolled
                else if (sugar >= 200) {
                    alerts.push({
                        type: "high",
                        vital: "Blood Sugar",
                        value: `${sugar} mg/dL`,
                        message: "High Blood Sugar (Uncontrolled)",
                        recommendation: isElderly
                            ? "Adjust medication. Review diet. Monitor closely for dehydration."
                            : "Adjust diabetes medication. Diet review.",
                        severity: "HIGH",
                        requiresAdmission: false
                    });
                }
                // ✅ LOW - Hypoglycemia
                else if (sugar < 70) {
                    const isSevereHypo = sugar < 50;
                    alerts.push({
                        type: isSevereHypo ? "critical" : "high",
                        vital: "Blood Sugar",
                        value: `${sugar} mg/dL`,
                        message: isSevereHypo ? "SEVERE HYPOGLYCEMIA - Emergency" : "Low Blood Sugar (Hypoglycemia)",
                        recommendation: isSevereHypo
                            ? "Give glucose immediately. If unconscious, IV dextrose. Admit for observation."
                            : "Give 15g fast-acting sugar (juice/glucose). Recheck in 15 minutes.",
                        severity: isSevereHypo ? "CRITICAL" : "HIGH",
                        requiresAdmission: isSevereHypo
                    });
                }
                // ✅ NEW: Borderline for elderly
                else if (isElderly && sugar >= 180) {
                    alerts.push({
                        type: "warning",
                        vital: "Blood Sugar",
                        value: `${sugar} mg/dL`,
                        message: "Elevated Blood Sugar (Elderly)",
                        recommendation: "Monitor closely. Adjust medication if consistently high.",
                        severity: "MODERATE",
                        requiresAdmission: false
                    });
                }
            }
        }

        // ==================== TEMPERATURE ====================
        if (vitals.temperature) {
            let temp = parseFloat(vitals.temperature);
            // Handle both °F and °C
            if (temp < 50 && temp > 30) {
                // Likely Celsius, convert to Fahrenheit for consistency
                temp = (temp * 9 / 5) + 32;
            }

            if (!isNaN(temp)) {
                // ✅ CRITICAL - Very High Fever (Sepsis risk)
                if (temp >= 103) {
                    alerts.push({
                        type: "critical",
                        vital: "Temperature",
                        value: `${temp.toFixed(1)}°F`,
                        message: "VERY HIGH FEVER - Sepsis Risk",
                        recommendation: "Check for source of infection. Blood cultures. Consider admission for IV antibiotics.",
                        severity: "CRITICAL",
                        requiresAdmission: true
                    });
                }
                // ✅ HIGH - Significant Fever
                else if (temp >= 101) {
                    alerts.push({
                        type: "high",
                        vital: "Temperature",
                        value: `${temp.toFixed(1)}°F`,
                        message: "High Fever",
                        recommendation: isChild
                            ? "Monitor for dehydration. Give paracetamol as per weight. Seek care if lethargic."
                            : "CBC, CRP. Check for infection source.",
                        severity: "HIGH",
                        requiresAdmission: false
                    });
                }
                // ✅ NEW: Hypothermia (Low temperature)
                else if (temp <= 95) {
                    alerts.push({
                        type: "warning",
                        vital: "Temperature",
                        value: `${temp.toFixed(1)}°F`,
                        message: "Hypothermia (Low Body Temperature)",
                        recommendation: "Warm patient gradually. Check thyroid function. Review medications.",
                        severity: "MODERATE",
                        requiresAdmission: temp <= 90
                    });
                }
            }
        }

        // ==================== PULSE ====================
        if (vitals.pulse) {
            const pulse = parseInt(vitals.pulse);
            if (!isNaN(pulse)) {
                // ✅ CRITICAL - Severe tachycardia or bradycardia
                if (pulse >= 140 || pulse < 50) {
                    alerts.push({
                        type: "critical",
                        vital: "Pulse",
                        value: `${pulse} bpm`,
                        message: pulse >= 140 ? "Severe Tachycardia" : "Severe Bradycardia",
                        recommendation: pulse >= 140
                            ? "ECG immediately. Check for arrhythmia. Consider cardiology consult."
                            : "ECG immediately. Check for heart block. Consider pacemaker if symptomatic.",
                        severity: "CRITICAL",
                        requiresAdmission: true
                    });
                }
                // ✅ HIGH - Tachycardia
                else if (pulse >= 120) {
                    alerts.push({
                        type: "high",
                        vital: "Pulse",
                        value: `${pulse} bpm`,
                        message: "Tachycardia (Fast Heart Rate)",
                        recommendation: "Check for fever, dehydration, anxiety, or arrhythmia. ECG if persistent.",
                        severity: "HIGH",
                        requiresAdmission: false
                    });
                }
                // ✅ LOW - Bradycardia (for non-athletes)
                else if (pulse < 60 && (!vitals?.isAthlete || vitals.isAthlete === false)) {
                    alerts.push({
                        type: "warning",
                        vital: "Pulse",
                        value: `${pulse} bpm`,
                        message: "Bradycardia (Slow Heart Rate)",
                        recommendation: "Check medications (beta-blockers). ECG if symptomatic (dizziness, fatigue).",
                        severity: "MODERATE",
                        requiresAdmission: false
                    });
                }
            }
        }

        // ==================== NEW: COMBINATION ALERTS ====================
        // High BP + High Pulse together
        const hasHighBPAlert = alerts.some(a => a.vital === "Blood Pressure" && a.type === "high");
        const hasHighPulseAlert = alerts.some(a => a.vital === "Pulse" && a.type === "high");

        if (hasHighBPAlert && hasHighPulseAlert) {
            alerts.push({
                type: "high",
                vital: "Combination",
                value: "BP High + Pulse High",
                message: "Hypertension with Tachycardia",
                recommendation: "Consider anxiety, pain, thyroid disorder, or dehydration. Evaluate comprehensively.",
                severity: "HIGH",
                requiresAdmission: false
            });
        }

        // ==================== NEW: TREND ANALYSIS (if previous vitals available) ====================
        if (previousVitals) {
            // BP trend
            if (vitals.bloodPressure && previousVitals.bloodPressure) {
                const currentSys = parseInt(vitals.bloodPressure.toString().split(/[/\s]+/)[0]);
                const prevSys = parseInt(previousVitals.bloodPressure.toString().split(/[/\s]+/)[0]);

                if (!isNaN(currentSys) && !isNaN(prevSys) && (currentSys - prevSys) >= 20) {
                    alerts.push({
                        type: "warning",
                        vital: "BP Trend",
                        value: `↑ ${currentSys - prevSys} mmHg`,
                        message: "Rapid Increase in Blood Pressure",
                        recommendation: "Check medication compliance. Consider adjusting therapy.",
                        severity: "MODERATE",
                        requiresAdmission: false
                    });
                }
            }
        }

        // ==================== PREGNANCY-SPECIFIC ALERTS ====================
        if (isPregnant) {
            if (vitals.bloodPressure) {
                const sys = parseInt(vitals.bloodPressure.toString().split(/[/\s]+/)[0]);
                const dia = parseInt(vitals.bloodPressure.toString().split(/[/\s]+/)[1]);

                if (sys >= 140 || dia >= 90) {
                    alerts.push({
                        type: "critical",
                        vital: "Pregnancy BP",
                        value: `${sys}/${dia} mmHg`,
                        message: "PREGNANCY HYPERTENSION - Preeclampsia Risk",
                        recommendation: "Check urine protein. Immediate OB/GYN consult. Monitor for seizures.",
                        severity: "CRITICAL",
                        requiresAdmission: true
                    });
                }
            }
        }

        return alerts;
    };

    // ==================== LOCAL FALLBACK (with Roman Urdu) ====================
    // const getLocalResponse = (complaintText, diagnosisList, vitals) => {
    //     const input = ((complaintText || "") + " " + (Array.isArray(diagnosisList) ? diagnosisList.join(" ") : diagnosisList || "")).toLowerCase();
    //     let hasHighBP = false, hasHighSugar = false, hasFever = false;
    //     if (vitals?.bloodPressure) { const p = vitals.bloodPressure.toString().split(/[/\s]+/); hasHighBP = parseInt(p[0]) >= 140; }
    //     if (vitals?.bloodSugar) hasHighSugar = parseInt(vitals.bloodSugar) >= 140;
    //     if (vitals?.temperature) hasFever = parseFloat(vitals.temperature) >= 99.5;

    //     if (input.includes("diabetes") || input.includes("sugar") || hasHighSugar) {
    //         return {
    //             diagnoses: [
    //                 { name: "Diabetes Mellitus Type 2 (ذیابیطس ٹائپ 2)", percentage: 75 },
    //                 { name: "Prediabetes (پری ذیابیطس)", percentage: 15 },
    //                 { name: "Insulin Resistance (انسولین مزاحمت)", percentage: 10 }
    //             ],
    //             basicTests: ["Blood Sugar Fasting (ناشتہ شوگر)", "HbA1c (گلائکوسلیٹڈ ہیموگلوبن)", "Urine Routine (پیشاب کا ٹیسٹ)"],
    //             recommendedTests: ["Lipid Profile (کولیسٹرول ٹیسٹ)", "Serum Creatinine (کریٹینائن)", "Microalbuminuria (مائیکرو البیومین)"],
    //             medicines: [
    //                 { name: "Metformin 500mg", dosage: "1 tablet khane ke baad (twice daily)", duration: "30 days" }
    //             ],
    //             treatment: "Meetha aur aata kam karein. Rozana subah 30 minute walk karein. Pani khoob piyein. Sugar roz check karein."
    //         };
    //     } else if (input.includes("hypertension") || input.includes("bp") || input.includes("headache") || hasHighBP) {
    //         return {
    //             diagnoses: [
    //                 { name: "Essential Hypertension (بنیادی بلڈ پریشر)", percentage: 70 },
    //                 { name: "Pre-hypertension (پری ہائی بلڈ پریشر)", percentage: 20 },
    //                 { name: "Secondary Hypertension (ثانوی بلڈ پریشر)", percentage: 10 }
    //             ],
    //             basicTests: ["BP Monitoring (بی پی چیک)", "Lipid Profile (کولیسٹرول)", "Serum Creatinine (کریٹینائن)"],
    //             recommendedTests: ["ECG (ای سی جی)", "Echocardiography (ایکو)", "Urine Microalbumin (پیشاب مائیکرو البیومین)"],
    //             medicines: [
    //                 { name: "Amlodipine 5mg", dosage: "1 tablet subah (once daily)", duration: "30 days" }
    //             ],
    //             treatment: "Namak bilkul kam karein. BP roz subah naap karein aur record rakhein. Stress kam karein. Walk karein."
    //         };
    //     } else if (input.includes("fever") || input.includes("viral") || hasFever) {
    //         return {
    //             diagnoses: [
    //                 { name: "Viral Fever (وائرل بخار)", percentage: 55 },
    //                 { name: "Bacterial Infection (بیکٹیریل انفیکشن)", percentage: 30 },
    //                 { name: "Malaria/Dengue (ملیریا/ڈینگی)", percentage: 15 }
    //             ],
    //             basicTests: ["CBC (بلڈ ٹیسٹ)", "Malaria Antigen (ملیریا ٹیسٹ)", "CRP (سی آر پی)"],
    //             recommendedTests: ["Blood Culture (بلڈ کلچر)", "Dengue NS1 (ڈینگی)", "Widal Test (وائیڈل)"],
    //             medicines: [
    //                 { name: "Paracetamol 500mg", dosage: "1 tablet jab bhi bukhar ho (every 6 hours)", duration: "3-5 days" },
    //                 { name: "ORS Sachet", dosage: "1 sachet 1 glass pani mein (as needed)", duration: "Jitni zaroorat ho" }
    //             ],
    //             treatment: "Khoob pani aur ORS piyein. Aram karein. 3 din mein theek na ho to wapas aayein. Garam pani se fomentation karein."
    //         };
    //     } else if (input.includes("cough") || input.includes("cold") || input.includes("respiratory")) {
    //         return {
    //             diagnoses: [
    //                 { name: "Upper Respiratory Infection (اوپری سانس کا انفیکشن)", percentage: 50 },
    //                 { name: "Allergic Rhinitis (الرجی ناک)", percentage: 30 },
    //                 { name: "Acute Bronchitis (شدید برونکائٹس)", percentage: 20 }
    //             ],
    //             basicTests: ["CBC (بلڈ ٹیسٹ)", "Chest X-Ray (چھاتی کا ایکس رے)"],
    //             recommendedTests: ["CRP (سی آر پی)", "Sputum C/S (بلغم کا ٹیسٹ)"],
    //             medicines: [
    //                 { name: "Paracetamol 500mg + Phenylephrine", dosage: "1 tablet teen baar (three times daily)", duration: "5 days" },
    //                 { name: "Ambroxyl Syrup (امبروکسل سیرپ)", dosage: "10ml din mein do baar (twice daily)", duration: "5 days" }
    //             ],
    //             treatment: "Garam pani se gargle karein. Steam lein. Thanda paani aur cold drinks se parhez karein. Aram karein."
    //         };
    //     } else {
    //         return {
    //             diagnoses: [
    //                 { name: "General OPD Visit (عام OPD چیک اپ)", percentage: 50 },
    //                 { name: "Nutritional Deficiency (غذائی کمی)", percentage: 30 },
    //                 { name: "Stress / Fatigue (تناؤ / تھکاوٹ)", percentage: 20 }
    //             ],
    //             basicTests: ["CBC (بلڈ ٹیسٹ)", "Blood Sugar Fasting (ناشتہ شوگر)"],
    //             recommendedTests: ["Lipid Profile (کولیسٹرول)", "Vitamin D (وٹامن ڈی)", "Vitamin B12 (وٹامن بی12)"],
    //             medicines: [
    //                 { name: "Multivitamin (ملٹی وٹامن)", dosage: "1 tablet din mein ek baar (once daily)", duration: "30 days" }
    //             ],
    //             treatment: "Phal aur sabziyan khoob khayein. Subah 30 minute walk karein. 7-8 ghante neend lein. Pani khoob piyein."
    //         };
    //     }
    // };

    const getLocalResponse = (complaintText, diagnosisList, vitals) => {

        const input = ((complaintText || "") + " " + (Array.isArray(diagnosisList) ? diagnosisList.join(" ") : diagnosisList || "")).toLowerCase();

        // Extract vitals
        let hasHighBP = false, hasHighSugar = false, hasFever = false, hasTachycardia = false;
        let patientAge = vitals?.age ? parseInt(vitals.age) : null;
        let patientGender = vitals?.gender || "";

        if (vitals?.bloodPressure) {
            const p = vitals.bloodPressure.toString().split(/[/\s]+/);
            hasHighBP = parseInt(p[0]) >= 140;
        }
        if (vitals?.bloodSugar) hasHighSugar = parseInt(vitals.bloodSugar) >= 140;
        if (vitals?.temperature) hasFever = parseFloat(vitals.temperature) >= 99.5;
        if (vitals?.pulse) hasTachycardia = parseInt(vitals.pulse) >= 100;

        // ========== DIABETES ==========
        if (input.includes("diabetes") || input.includes("sugar") || hasHighSugar) {
            // Age-based medicine adjustment
            let medicineDosage = "1 tablet twice daily after meals";
            if (patientAge && patientAge > 60) {
                medicineDosage = "1 tablet once daily with dinner (lower dose for elderly)";
            } else if (patientAge && patientAge < 12) {
                medicineDosage = "Consult pediatrician for proper dosing";
            }

            return {
                diagnoses: [
                    { name: "Diabetes Mellitus Type 2", percentage: 75 },
                    { name: "Prediabetes", percentage: 15 },
                    { name: "Insulin Resistance", percentage: 10 }
                ],
                basicTests: ["Blood Sugar Fasting", "HbA1c", "Urine Routine"],
                recommendedTests: ["Lipid Profile", "Serum Creatinine", "Microalbuminuria"],
                medicines: [
                    { name: "Metformin 500mg", dosage: medicineDosage, duration: "30 days" }
                ],
                treatment: patientAge && patientAge > 60
                    ? "Reduce sugar intake. Walk daily as tolerated. Monitor blood sugar. Follow up in 2 weeks."
                    : "Reduce sugar and refined carbs. Walk 30 minutes daily. Drink plenty of water. Check blood sugar regularly."
            };
        }

        // ========== HYPERTENSION ==========
        else if (input.includes("hypertension") || input.includes("bp") || input.includes("headache") || hasHighBP) {
            let medicineDosage = "1 tablet once daily in morning";
            if (patientAge && patientAge > 60) {
                medicineDosage = "1 tablet once daily at bedtime (to avoid falls)";
            }

            return {
                diagnoses: [
                    { name: "Essential Hypertension", percentage: 70 },
                    { name: "Pre-hypertension", percentage: 20 },
                    { name: "Secondary Hypertension", percentage: 10 }
                ],
                basicTests: ["BP Monitoring", "Lipid Profile", "Serum Creatinine"],
                recommendedTests: ["ECG", "Echocardiography", "Urine Microalbumin"],
                medicines: [
                    { name: "Amlodipine 5mg", dosage: medicineDosage, duration: "30 days" }
                ],
                treatment: patientAge && patientAge > 60
                    ? "Reduce salt. Measure BP daily. Sit slowly to avoid dizziness. Follow up in 1 week."
                    : "Reduce salt significantly. Measure BP daily in morning. Manage stress. Walk regularly."
            };
        }

        // ========== FEVER ==========
        else if (input.includes("fever") || input.includes("viral") || input.includes("flu") || hasFever) {
            let paracetamolDosage = "1 tablet every 6 hours when fever present";
            if (patientAge && patientAge < 12) {
                paracetamolDosage = "As per weight: 10-15 mg/kg every 6 hours";
            }

            return {
                diagnoses: [
                    { name: "Viral Fever", percentage: 55 },
                    { name: "Bacterial Infection", percentage: 30 },
                    { name: "Malaria/Dengue", percentage: 15 }
                ],
                basicTests: ["CBC", "Malaria Antigen", "CRP"],
                recommendedTests: ["Blood Culture", "Dengue NS1", "Widal Test"],
                medicines: [
                    { name: "Paracetamol 500mg", dosage: paracetamolDosage, duration: "3-5 days" },
                    { name: "ORS Sachet", dosage: "1 sachet in 1 glass water as needed", duration: "As required" }
                ],
                treatment: "Drink plenty of water and ORS. Take rest. If fever persists beyond 3 days or worsens, return for follow up. Use lukewarm water sponging."
            };
        }

        // ========== COUGH / COLD / RESPIRATORY ==========
        else if (input.includes("cough") || input.includes("cold") || input.includes("respiratory") || input.includes("flu")) {
            return {
                diagnoses: [
                    { name: "Upper Respiratory Infection", percentage: 50 },
                    { name: "Allergic Rhinitis", percentage: 30 },
                    { name: "Acute Bronchitis", percentage: 20 }
                ],
                basicTests: ["CBC", "Chest X-Ray"],
                recommendedTests: ["CRP", "Sputum Culture"],
                medicines: [
                    { name: "Paracetamol 500mg", dosage: "1 tablet three times daily", duration: "5 days" },
                    { name: "Ambroxol Syrup", dosage: patientAge && patientAge < 12 ? "5ml twice daily" : "10ml twice daily", duration: "5 days" }
                ],
                treatment: "Gargle with warm salt water. Take steam inhalation. Avoid cold drinks. Take rest. Complete medication course."
            };
        }

        // ========== HEADACHE / MIGRAINE ==========
        else if (input.includes("headache") || input.includes("migraine") || input.includes("sir dard")) {
            return {
                diagnoses: [
                    { name: "Tension Headache", percentage: 50 },
                    { name: "Migraine", percentage: 30 },
                    { name: "Hypertension Related", percentage: 20 }
                ],
                basicTests: ["BP Monitoring", "CBC"],
                recommendedTests: ["Brain CT", "Eye Examination"],
                medicines: [
                    { name: "Paracetamol 500mg", dosage: "1 tablet as needed (max 4 tablets/day)", duration: "3 days" }
                ],
                treatment: "Rest in dark room. Avoid screen time. Stay hydrated. If severe or recurrent, consult physician."
            };
        }

        // ========== GENERAL / DEFAULT ==========
        else {
            return {
                diagnoses: [
                    { name: "General OPD Visit", percentage: 50 },
                    { name: "Nutritional Deficiency", percentage: 30 },
                    { name: "Stress and Fatigue", percentage: 20 }
                ],
                basicTests: ["Complete Blood Count", "Blood Sugar Fasting"],
                recommendedTests: ["Lipid Profile", "Vitamin D", "Vitamin B12"],
                medicines: [
                    { name: "Multivitamin", dosage: "1 tablet once daily", duration: "30 days" }
                ],
                treatment: "Eat more fruits and vegetables. Walk 30 minutes daily. Get 7-8 hours of sleep. Drink plenty of water."
            };
        }
    };

    // ====================LOCAL FALLBACK ( ADMISSION LOGIC ) ====================
    // const getAdmissionDecision = () => {
    //     const vitalAlerts = aiVitalAlerts || [];
    //     const hasCritical = vitalAlerts.some((a) => a.type === "critical");
    //     const hasHigh = vitalAlerts.some((a) => a.type === "high");
    //     const diagStr = (Array.isArray(primaryDiagnosis) ? primaryDiagnosis.join(" ") : primaryDiagnosis || "").toLowerCase();
    //     const complaintStr = (complaint || "").toLowerCase();
    //     const criticalWords = ["heart attack", "stroke", "sepsis", "dka", "hypertensive crisis", "myocardial"];
    //     const isCriticalCondition = criticalWords.some((w) => diagStr.includes(w) || complaintStr.includes(w));

    //     if (hasCritical || isCriticalCondition) return { required: true, urgency: "EMERGENCY", reason: "Critical vitals ya serious condition detect hui hai. Fori hospital admission zaroori hai.", department: "Emergency / ICU" };
    //     if (hasHigh) return { required: true, urgency: "URGENT", reason: "Vitals mein kharabiyaan hain. Admission se behtar management hogi.", department: "General Ward" };
    //     return { required: false, urgency: "OUTPATIENT", reason: "Ye case OPD mein manage ho sakta hai. Follow-up as advised.", department: "OPD" };
    // };

    const getAdmissionDecision = () => {
        const vitalAlerts = aiVitalAlerts || [];
        const hasCritical = vitalAlerts.some((a) => a.type === "critical");
        const hasHigh = vitalAlerts.some((a) => a.type === "high");

        const diagStr = (Array.isArray(primaryDiagnosis) ? primaryDiagnosis.join(" ") : primaryDiagnosis || "").toLowerCase();
        const complaintStr = (complaint || "").toLowerCase();

        // Critical conditions that need immediate admission
        const criticalWords = [
            "heart attack", "myocardial", "stroke", "cva",
            "sepsis", "dka", "diabetic ketoacidosis",
            "hypertensive crisis", "pneumonia", "meningitis"
        ];

        // High risk conditions that may need admission
        const highRiskWords = [
            "chest pain", "difficulty breathing", "shortness of breath",
            "uncontrolled diabetes", "uncontrolled bp", "severe dehydration"
        ];

        const isCriticalCondition = criticalWords.some((w) => diagStr.includes(w) || complaintStr.includes(w));
        const isHighRiskCondition = highRiskWords.some((w) => diagStr.includes(w) || complaintStr.includes(w));

        // Emergency admission (CRITICAL)
        if (hasCritical || isCriticalCondition) {
            return {
                required: true,
                urgency: "EMERGENCY",
                reason: "Critical vitals abnormality or serious medical condition detected. Immediate hospital admission is required for proper management.",
                department: "Emergency / ICU"
            };
        }

        // Urgent admission (HIGH)
        if (hasHigh || isHighRiskCondition) {
            return {
                required: true,
                urgency: "URGENT",
                reason: "Vital signs are abnormal or high-risk symptoms present. Hospital admission is recommended for better monitoring and treatment.",
                department: "General Ward"
            };
        }

        // OPD management (NO admission needed)
        return {
            required: false,
            urgency: "OUTPATIENT",
            reason: "Vitals are stable. This case can be managed in OPD setting. Follow up as advised by the doctor.",
            department: "OPD"
        };
    };


    // const fetchAISuggestion = async () => {
    //     setLoading(true);
    //     setUsingGemini(false);
    //     try {
    //         const result = await fetchGeminiSuggestion(complaint, primaryDiagnosis, currentVitals);
    //         setAiResponse(result);
    //         setUsingGemini(true);
    //     } catch (err) {
    //         console.warn("Gemini failed, using local fallback:", err.message);
    //         await new Promise((r) => setTimeout(r, 400));
    //         setAiResponse(getLocalResponse(complaint, primaryDiagnosis, currentVitals));
    //         setUsingGemini(false);
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    // ==================== HANDLERS ====================

    const fetchAISuggestion = async () => {

        setLoading(true);
        setUsingGemini(false);
        try {
            const result = await fetchGeminiSuggestion(complaint, primaryDiagnosis, currentVitals);
            setAiResponse(result);

            // ✅ Agar Gemini ne vitalAlerts diye to woh use karo
            if (result.vitalAlerts && result.vitalAlerts.length >= 0) {
                setAiVitalAlerts(result.vitalAlerts);
            } else {
                // Fallback: local analysis
                setAiVitalAlerts(analyzeVitals(currentVitals));
            }

            setUsingGemini(true);
        } catch (err) {
            console.warn("Gemini failed, using local fallback:", err.message);
            await new Promise((r) => setTimeout(r, 400));
            const localResult = getLocalResponse(complaint, primaryDiagnosis, currentVitals);
            setAiResponse(localResult);

            // ✅ Fallback mein local analysis
            setAiVitalAlerts(analyzeVitals(currentVitals));
            setUsingGemini(false);
        } finally {
            setLoading(false);
        }

    };


    const handleNewResponse = () => {
        const alerts = analyzeVitals(currentVitals);
        setAiVitalAlerts(alerts);
        setSelectedBasicTests([]);
        setSelectedRecommendedTests([]);
        setSelectedMedicines([]);
        fetchAISuggestion();
    };

    const handleReset = () => {
        setAiResponse(null);
        setAiVitalAlerts([]);
        setSelectedBasicTests([]);
        setSelectedRecommendedTests([]);
        setSelectedMedicines([]);
        setUsingGemini(false);
    };

    const handleAddBasicTests = () => {
        const newSBT = selectedBasicTests?.map((i) => i?.split(" (")[0]);
        if (newSBT.length > 0 && onAddTests) {

            onAddTests(newSBT);
            setSelectedBasicTests([]);
        }
    };


    const handleAddRecommendedTests = () => {
        const newSRT = selectedRecommendedTests?.map((i) => i?.split(" (")[0]);

        if (newSRT.length > 0 && onAddTests) {
            onAddTests(newSRT);
            setSelectedRecommendedTests([]);
        }
    };


    const handleAddMedicines = () => {
        if (selectedMedicines.length > 0 && onAddMedicines) {
            onAddMedicines(selectedMedicines);
            setSelectedMedicines([]);
        }
    };

    const handleAddMedicinePlan = () => {
        if (aiResponse?.medicinePlan && onAddMedicinePlan) {
            onAddMedicinePlan(aiResponse.medicinePlan);
            toast.success("Medicine plan copied");
        }
    };

    const toggle = (list, setList, val) => setList((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));

    if (!visible) return null;

    const vitalAlerts = aiVitalAlerts || [];
    const admissionDecision = aiResponse?.admissionDecision ?? (aiResponse ? getAdmissionDecision() : null);


    // ==================== TABS ====================

    const tabs = [];

    if (aiResponse) {
        tabs.push({
            key: "admission",
            label: <span><MedicineBoxOutlined /> Admission</span>,
            children: (
                <div className={`p-4 rounded-xl ${admissionDecision.required ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                    <div className="flex items-start gap-3 mb-3">
                        {admissionDecision.required
                            ? <MedicineBoxOutlined className="text-red-500 text-xl mt-1" />
                            : <HomeOutlined className="text-green-500 text-xl mt-1" />}
                        <div>
                            <p className="font-semibold text-base m-0">
                                {/* {admissionDecision.required ? "Admission Zaroor Hai" : "OPD Management Theek Hai"} */}
                                {admissionDecision.required ? "Admission is Required" : "OPD Management is Appropriate"}
                            </p>
                            <Tag color={admissionDecision.required ? "red" : "green"} className="mt-1 text-xs">
                                {admissionDecision.urgency}
                            </Tag>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{admissionDecision.reason}</p>
                    <p className="text-xs text-gray-500"><strong>Department:</strong> {admissionDecision.department}</p>
                </div>
            ),
        });
    }

    if (vitalAlerts.length > 0) {
        tabs.push({
            key: "alerts",
            label: (
                <span>
                    <WarningOutlined className="text-red-500" /> Vitals Alert
                    <Badge count={vitalAlerts.length} size="small" className="ml-1" style={{ backgroundColor: "#ef4444" }} />
                </span>
            ),
            children: (
                <div className="space-y-2 max-h-80 flex flex-col gap-5 overflow-y-auto">
                    {vitalAlerts.map((alert, i) => (
                        <Alert
                            key={i}
                            type={alert.type === "critical" ? "error" : "warning"}
                            showIcon
                            message={
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm">{alert.vital}: {alert.value}</span>
                                    <Tag color={alert.type === "critical" ? "red" : "orange"} className="text-xs">{alert.severity}</Tag>
                                </div>
                            }
                            description={
                                <div>
                                    <p className="text-sm font-medium mt-1">{alert.message}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">Recommendation: {alert.recommendation}</p>
                                </div>
                            }
                        />
                    ))}
                </div>
            ),
        });
    }

    tabs.push({
        key: "diagnosis",
        label: <span><ExperimentOutlined /> Diagnosis & Tests</span>,
        children: (
            <div className="space-y-4">
                {/* Possible Diagnoses */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 m-0 uppercase tracking-wide">Possible Diagnoses</p>
                        <Tag color={usingGemini ? "blue" : "purple"} className="text-xs">
                            {usingGemini ? "Gemini AI" : "Local AI"}
                        </Tag>
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                        {aiResponse?.diagnoses.map((d, i) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="text-sm text-gray-800">{d.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                        <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${d.percentage}%` }} />
                                    </div>
                                    <span className="text-sm font-semibold text-purple-600 min-w-9 text-right">{d.percentage}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <Divider className="my-2" />

                {/* Basic Tests */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 m-0 uppercase tracking-wide">Basic Tests (Must Do)</p>
                        <span className="text-xs text-green-600 font-medium">Essential</span>
                    </div>
                    <div className="space-y-1.5">
                        {aiResponse?.basicTests.map((test, i) => (
                            <label key={i} className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                                <Checkbox checked={selectedBasicTests.includes(test)} onChange={() => toggle(selectedBasicTests, setSelectedBasicTests, test)} />
                                <span className="text-sm text-gray-700 flex-1">{test}</span>
                                <Tag color="green" className="text-xs">Basic</Tag>
                            </label>
                        ))}
                    </div>
                    <Button
                        size="small"
                        disabled={selectedBasicTests.length === 0}
                        onClick={handleAddBasicTests}
                        className="mt-2 w-full bg-green-500 text-white border-none hover:bg-green-600 text-xs"
                    >
                        + Add {selectedBasicTests.length > 0 ? `(${selectedBasicTests.length})` : ""} Basic Tests
                    </Button>
                </div>

                {/* Recommended Tests */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-500 m-0 uppercase tracking-wide">Recommended Tests</p>
                        <span className="text-xs text-amber-600 font-medium">If needed</span>
                    </div>
                    <div className="space-y-1.5">
                        {aiResponse?.recommendedTests.map((test, i) => (
                            <label key={i} className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
                                <Checkbox checked={selectedRecommendedTests.includes(test)} onChange={() => toggle(selectedRecommendedTests, setSelectedRecommendedTests, test)} />
                                <span className="text-sm text-gray-700 flex-1">{test}</span>
                                <Tag color="orange" className="text-xs">Opt.</Tag>
                            </label>
                        ))}
                    </div>
                    <Button
                        size="small"
                        disabled={selectedRecommendedTests.length === 0}
                        onClick={handleAddRecommendedTests}
                        className="mt-2 w-full border-amber-400 text-amber-600 text-xs hover:bg-amber-50"
                    >
                        + Add {selectedRecommendedTests.length > 0 ? `(${selectedRecommendedTests.length})` : ""} Recommended Tests
                    </Button>
                </div>
            </div>
        ),
    });

    // tabs.push({
    //     key: "medicines",
    //     label: <span><MedicineBoxOutlined /> Medicines</span>,
    //     children: (
    //         <div className="space-y-4">

    //             {/* Medicines */}
    //             <div>
    //                 <p className="text-xs font-semibold text-gray-500 m-0 mb-2 uppercase tracking-wide">Recommended Medicines</p>
    //                 <div className="space-y-2">
    //                     {aiResponse?.medicines.map((med, i) => (
    //                         <label key={i} className="flex items-start gap-3 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
    //                             <Checkbox
    //                                 checked={selectedMedicines.includes(med.name)}
    //                                 onChange={() => toggle(selectedMedicines, setSelectedMedicines, med.name)}
    //                                 className="mt-0.5"
    //                             />
    //                             <div className="flex-1">
    //                                 <p className="font-semibold text-sm text-gray-800 m-0">{med.name}</p>
    //                                 <p className="text-xs text-gray-500 mt-0.5 m-0">{med.dosage} &bull; {med.duration}</p>
    //                             </div>
    //                         </label>
    //                     ))}
    //                 </div>
    //                 <Button
    //                     type="primary"
    //                     disabled={selectedMedicines.length === 0}
    //                     onClick={handleAddMedicines}
    //                     className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-sm !p-4"
    //                     size="small"
    //                 >
    //                     Add Selected Medicines {selectedMedicines.length > 0 ? `(${selectedMedicines.length})` : ""}
    //                 </Button>
    //             </div>

    //             <Divider className="my-1" />

    //             {/* Treatment Plan */}
    //             <div>
    //                 <p className="text-xs font-semibold text-gray-500 m-0 mb-2 uppercase tracking-wide">Treatment Plan</p>
    //                 <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
    //                     <p className="text-sm text-gray-700 m-0 leading-relaxed">{aiResponse?.treatment}</p>
    //                 </div>
    //                 <Button
    //                     type="dashed"
    //                     onClick={() => onAddTreatment && onAddTreatment(aiResponse?.treatment)}
    //                     className="mt-2 w-full border-indigo-400 text-indigo-600 text-xs hover:bg-indigo-50 !p-4"
    //                     size="small"
    //                 >
    //                     Copy to Treatment Field
    //                 </Button>
    //             </div>

    //         </div>
    //     ),
    // });

    tabs.push({
        key: "medicines",
        label: <span><MedicineBoxOutlined /> Medicines</span>,
        children: (
            <div className="space-y-4">

                {/* ========== SECTION 1: MEDICINES LIST (for Select dropdown) ========== */}
                <div>
                    <p className="text-xs font-semibold text-gray-500 m-0 mb-2 uppercase tracking-wide">
                        💊 Recommended Medicines
                    </p>
                    <div className="space-y-2">
                        {aiResponse?.medicines.map((med, i) => (
                            <label key={i} className="flex items-start gap-3 px-3 py-2.5 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                                <Checkbox
                                    checked={selectedMedicines.includes(med.name)}
                                    onChange={() => toggle(selectedMedicines, setSelectedMedicines, med.name)}
                                    className="mt-0.5"
                                />
                                <div className="flex-1">
                                    <p className="font-semibold text-sm text-gray-800 m-0">{med.name}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 m-0">{med.dosage} &bull; {med.duration}</p>
                                </div>
                            </label>
                        ))}
                    </div>
                    <Button
                        type="primary"
                        disabled={selectedMedicines.length === 0}
                        onClick={handleAddMedicines}
                        className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-sm p-4!"
                        size="small"
                    >
                        + Add Selected Medicines {selectedMedicines.length > 0 ? `(${selectedMedicines.length})` : ""}
                    </Button>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                        These medicines will be added to the "Medicines" select dropdown
                    </p>
                </div>

                {/* ========== SECTION 2: MEDICINE PLAN (NEW) ========== */}
                {aiResponse?.medicinePlan && (
                    <>
                        <Divider className="my-2" />
                        <div>
                            <p className="text-xs font-semibold text-gray-500 m-0 mb-2 uppercase tracking-wide">
                                📋 AI Medicine Plan
                            </p>
                            <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                <p className="text-sm text-gray-700 m-0 leading-relaxed">{aiResponse.medicinePlan}</p>
                            </div>
                            <Button
                                type="dashed"
                                onClick={handleAddMedicinePlan}
                                className="mt-2 w-full border-teal-400 text-teal-600 text-xs hover:bg-teal-50 p-4!"
                                size="small"
                            >
                                Copy to Medicine Plan Field
                            </Button>
                            <p className="text-xs text-gray-400 mt-1 text-center">
                                This will be added to the "Medicine Plan" text area
                            </p>
                        </div>
                    </>
                )}

                {/* ========== SECTION 3: TREATMENT PLAN (Existing) ========== */}
                <Divider className="my-2" />
                <div>
                    <p className="text-xs font-semibold text-gray-500 m-0 mb-2 uppercase tracking-wide">
                        🏥 Treatment Plan (General Advice)
                    </p>
                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                        <p className="text-sm text-gray-700 m-0 leading-relaxed">{aiResponse?.treatment}</p>
                    </div>
                    <Button
                        type="dashed"
                        onClick={() => onAddTreatment && onAddTreatment(aiResponse?.treatment)}
                        className="mt-2 w-full border-indigo-400 text-indigo-600 text-xs hover:bg-indigo-50 !p-4"
                        size="small"
                    >
                        Copy to Treatment Field
                    </Button>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                        This will be added to the "Treatment" text area
                    </p>
                </div>

            </div>
        ),
    });




    return (

        <div className="fixed inset-0 bg-black/50 z-1000 flex items-center justify-center p-4">

            <div
                className="w-full max-w-2xl bg-white shadow-2xl flex flex-col"
                style={{ borderRadius: "20px", maxHeight: "90vh", overflow: "hidden" }}
            >

                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 bg-linear-to-r from-purple-600 to-blue-500 text-white shrink-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <BulbOutlined style={{ fontSize: "20px" }} />
                        <h2 className="text-lg font-semibold m-0">AI Smart Assistant</h2>
                        <Tag color="gold" className="text-xs ml-1">BETA</Tag>
                        {usingGemini && <Tag color="cyan" className="text-xs">Gemini</Tag>}
                    </div>
                    {/* ✅ New Response + Reset + Close buttons */}
                    <div className="flex items-center gap-2">
                        {aiResponse && !loading && (
                            <>
                                <Button
                                    size="small"
                                    icon={<ReloadOutlined />}
                                    onClick={handleNewResponse}
                                    className="text-white border-white/40 hover:bg-white/20! hover:text-white! text-xs"
                                    type="text"
                                >
                                    New
                                </Button>
                                <Button
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={handleReset}
                                    className="text-white border-white/40 hover:bg-white/20! hover:text-white! text-xs"
                                    type="text"
                                >
                                    Reset
                                </Button>
                            </>
                        )}
                        <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={onClose}
                            className="text-white hover:text-white! hover:bg-white/20!"
                        />
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {loading && (
                        <div className="text-center py-16">
                            <Spin size="large" />
                            <p className="text-gray-500 mt-4 text-sm">AI patient data analyze kar raha hai...</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {usingGemini ? "Google Gemini AI" : "Local AI"} se suggestions aa rahi hain
                            </p>
                        </div>
                    )}

                    {!loading && !aiResponse && (
                        <div className="text-center py-16">
                            <BulbOutlined className="text-4xl text-purple-400" />
                            <p className="text-gray-500 mt-4 text-sm">Koi data nahi. Pehle complaint ya diagnosis add karein.</p>
                            <Button onClick={handleNewResponse} type="primary" className="mt-3 bg-purple-500 hover:bg-purple-600 border-none">
                                Get Suggestion
                            </Button>
                        </div>
                    )}

                    {aiResponse && !loading && (
                        <Tabs
                            defaultActiveKey={vitalAlerts.length > 0 ? "alerts" : "admission"}
                            items={tabs}
                            size="small"
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="px-4 py-2 bg-gray-50 border-t text-center shrink-0">
                    <p className="text-xs text-gray-400 m-0">
                        AI suggestions are for the doctor's guidance — the final decision will be made by the doctor.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default AiAssistant;







































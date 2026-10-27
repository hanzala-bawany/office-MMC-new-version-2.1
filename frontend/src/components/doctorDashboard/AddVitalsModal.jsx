import { Modal, Input, Button } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { base_URL } from "../../utills/baseUrl";

const AddVitalsModal = ({ isOpen, onClose, currentPatientsVitals, loginUserData, VITALS_CONFIG, currentPatientsData, docPatientData }) => {

    // console.log(currentPatientsData, "<<<<<< currentPatientsData");
    // console.log(currentPatientsVitals, "<<<<<< currentPatientsVitals");
    // console.log(loginUserData , "<<<<< loginUserData");

    const [loading, setLoading] = useState(false);
    const [vitalsForm, setVitalsForm] = useState({
        bloodPressure: "",
        bloodSugar: "",
        weight: "",
        height: "",
        temperature: "",
        pulse: "",
    });


    const saveVitalsHandler = async () => {

        try {
            setLoading(true);
            const res = await axios.post(`${base_URL}/api/opd/doctor/patient-vitals/add`, {
                receiptNo: currentPatientsData?.RECEIPTNO || null,
                bloodPressure: vitalsForm?.bloodPressure || null,
                bloodSugar: vitalsForm?.bloodSugar || null,
                weight: vitalsForm?.weight || null,
                height: vitalsForm?.height || null,
                temperature: vitalsForm?.temperature || null,
                pulse: vitalsForm?.pulse || null,
                createdBy: loginUserData?.name || null
            });
            // console.log(res, "res of save vital Handler by id");

            // setSelectedDoctorId(null);
            // setSelectedPatient(null);
            // setSaved(true);
            // setVitals({});
            await docPatientData();
            toast.success(`Vitals saved successfully!`);

        }
        catch (err) {
            console.log(err, "error in save vital Handler");
            toast.error(err?.message);
        }
        finally {
            setLoading(false);
        }

    };

    const handleClose = () => {
        onClose();
    };

    useEffect(() => {

        // if (!currentPatientsVitals) return;

        setVitalsForm({
            bloodPressure: currentPatientsVitals?.CBLOOD_PRESSURE || "",
            bloodSugar: currentPatientsVitals?.CBLOOD_SUGAR || "",
            weight: currentPatientsVitals?.CWEIGHT || "",
            height: currentPatientsVitals?.CHEIGHT || "",
            temperature: currentPatientsVitals?.CTEMPERATURE || "",
            pulse: currentPatientsVitals?.CPULSE || "",
        });

    }, [currentPatientsVitals]);



    return (

        <Modal
            title={
                <span className="text-white font-semibold text-base">
                    Add Patient Vitals
                </span>
            }
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            centered
            styles={{
                header: {
                    background: "linear-gradient(135deg, #4f46e5, #3b82f6)",
                    padding: "14px 20px",
                    borderRadius: "8px 8px 0 0",
                },
                body: { padding: "20px" },
            }}
        >
            {/* Patient Info Tag */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl px-4 py-3 mb-5 shadow-sm flex flex-wrap items-center justify-between gap-3">

                {/* Name */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-semibold">
                        {currentPatientsData?.PATIENTNAME?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">
                            {currentPatientsData?.PATIENTNAME}
                        </p>
                        <p className="text-xs text-gray-500">
                            Patient
                        </p>
                    </div>
                </div>

                {/* Token */}
                <div className="text-xs bg-white px-3 py-1 rounded-full border text-gray-600">
                    Token: <span className="font-medium">{currentPatientsData?.TOKENNO}</span>
                </div>

                {/* Age */}
                <div className="text-xs bg-white px-3 py-1 rounded-full border text-gray-600">
                    Age: <span className="font-medium">{currentPatientsData?.AGE}</span>
                </div>

            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-4">
                {
                    VITALS_CONFIG.map(({ label, currentKey, formKey, borderColor, unit }) => (

                        <div key={formKey}>
                            <label className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                                <span
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        background: borderColor,
                                        display: "inline-block",
                                    }}
                                />
                                {label}
                            </label>

                            <Input
                                // placeholder={placeholder}
                                type={formKey === "bloodPressure" || formKey === "height" ? "text" : "number"}
                                suffix={<span className="text-xs text-gray-400">{unit}</span>}
                                value={vitalsForm[formKey]}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    if (formKey === "bloodPressure") {
                                        if (val === "" || /^[\d/]*$/.test(val)) {
                                            setVitalsForm({ ...vitalsForm, [formKey]: val, })
                                        }
                                    } else if (formKey === "height") {
                                        // feet'inches", e.g. 5'8"
                                        if (val === "" || /^[\d'"\s.]*$/.test(val)) {
                                            setVitalsForm({ ...vitalsForm, [formKey]: val, })
                                        }
                                    } else {
                                        setVitalsForm({ ...vitalsForm, [formKey]: val, })
                                    }
                                }}
                            />

                        </div>

                    ))
                }
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    type="primary"
                    loading={loading}
                    className="bg-indigo-600 border-none"
                    onClick={saveVitalsHandler}
                >
                    Save Vitals
                </Button>
            </div>

        </Modal>
    );
};

export default AddVitalsModal;

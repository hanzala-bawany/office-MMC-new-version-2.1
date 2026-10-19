import { Typography, Tag, Divider } from "antd";
import ReportsLayout from "../../Layouts/ReportsLayout";

const { Title, Text } = Typography;

const UrineReport = ({ patientData }) => {

    // Simple Urine Report Data
    const urineTests = [
        { name: "Color", value: "Yellow", normalRange: "Yellow / Straw" },
        { name: "Appearance", value: "Clear", normalRange: "Clear" },
        { name: "Specific Gravity", value: "1.020", normalRange: "1.005 - 1.030" },
        { name: "pH", value: "6.5", normalRange: "4.5 - 8.0" },
        { name: "Protein", value: "Negative", normalRange: "Negative - Trace" },
        { name: "Glucose", value: "Negative", normalRange: "Negative" },
        { name: "Ketones", value: "Negative", normalRange: "Negative" },
        { name: "Blood", value: "Negative", normalRange: "Negative" },
        { name: "Bilirubin", value: "Negative", normalRange: "Negative" },
        { name: "Urobilinogen", value: "0.2", normalRange: "0.1 - 1.0" },
        { name: "Nitrite", value: "Negative", normalRange: "Negative" },
        { name: "Leukocyte Esterase", value: "Negative", normalRange: "Negative" },
        { name: "RBC", value: "0-2", normalRange: "0-5 /HPF" },
        { name: "WBC", value: "2-4", normalRange: "0-5 /HPF" },
        { name: "Epithelial Cells", value: "Few", normalRange: "Few" },
        { name: "Casts", value: "None", normalRange: "None" },
        { name: "Crystals", value: "None", normalRange: "None" },
        { name: "Bacteria", value: "None", normalRange: "None" },
    ];

    return (
        <div className="p-4">

            <ReportsLayout Title="Urine" currentPatientData={patientData}>

                <div className="p-2">

                    {/* Tests Table */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="grid grid-cols-3 bg-gray-100 px-4 py-2 font-semibold text-gray-600 text-sm">
                            <span>Test Name</span>
                            <span>Result</span>
                            <span>Normal Range</span>
                        </div>
                        {urineTests.map((test, idx) => (
                            <div 
                                key={idx}
                                className={`grid grid-cols-3 px-4 py-2 text-sm ${
                                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                } border-t border-gray-100`}
                            >
                                <span className="font-medium text-gray-700">{test.name}</span>
                                <span className="text-gray-800 font-semibold">{test.value}</span>
                                <span className="text-gray-500">{test.normalRange}</span>
                            </div>
                        ))}
                    </div>
    
                </div>

            </ReportsLayout>
        </div>
    );
};

export default UrineReport;
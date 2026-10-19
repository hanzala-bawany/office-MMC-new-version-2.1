import ReportsLayout from "../../Layouts/ReportsLayout";

const KidneyFunction = ({ patientData }) => {

    // Sample data - replace with actual data from patientData
    const kidneyData = {
        urea: patientData?.UREA || 28,
        creatinine: patientData?.CREATININE || 0.9,
        bun: patientData?.BUN || 12,
        uricAcid: patientData?.URIC_ACID || 4.5,
        sodium: patientData?.SODIUM || 140,
        potassium: patientData?.POTASSIUM || 4.2,
        chloride: patientData?.CHLORIDE || 102,
        bicarbonate: patientData?.BICARBONATE || 24,
        eGFR: patientData?.EGFR || 95,
    };

    // Reference ranges
    const referenceRanges = {
        urea: { min: 7, max: 20, unit: "mg/dL" },
        creatinine: { min: 0.6, max: 1.2, unit: "mg/dL" },
        bun: { min: 6, max: 20, unit: "mg/dL" },
        uricAcid: { min: 3.5, max: 7.2, unit: "mg/dL" },
        sodium: { min: 136, max: 145, unit: "mEq/L" },
        potassium: { min: 3.5, max: 5.1, unit: "mEq/L" },
        chloride: { min: 98, max: 106, unit: "mEq/L" },
        bicarbonate: { min: 22, max: 28, unit: "mEq/L" },
        eGFR: { min: 90, max: 120, unit: "mL/min/1.73m²" },
    };

    const getStatusColor = (value, range) => {
        if (value < range.min) return "text-blue-600 bg-blue-50 border-blue-200";
        if (value > range.max) return "text-red-600 bg-red-50 border-red-200";
        return "text-green-600 bg-green-50 border-green-200";
    };

    const getStatusText = (value, range) => {
        if (value < range.min) return "Low";
        if (value > range.max) return "High";
        return "Normal";
    };



    return (
        <div className="p-4">
            <ReportsLayout Title="Kidney Function Test" currentPatientData={patientData}>

                <div className="my6">

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-600 font-medium">eGFR</p>
                            <p className="text-2xl font-bold text-blue-700">{kidneyData.eGFR} <span className="text-sm font-normal">mL/min</span></p>
                            <p className="text-xs text-blue-500">Estimated GFR</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                            <p className="text-sm text-purple-600 font-medium">Creatinine</p>
                            <p className="text-2xl font-bold text-purple-700">{kidneyData.creatinine} <span className="text-sm font-normal">mg/dL</span></p>
                            <p className="text-xs text-purple-500">Range: 0.6 - 1.2</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                            <p className="text-sm text-green-600 font-medium">Urea</p>
                            <p className="text-2xl font-bold text-green-700">{kidneyData.urea} <span className="text-sm font-normal">mg/dL</span></p>
                            <p className="text-xs text-green-500">Range: 7 - 20</p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                            <p className="text-sm text-orange-600 font-medium">Uric Acid</p>
                            <p className="text-2xl font-bold text-orange-700">{kidneyData.uricAcid} <span className="text-sm font-normal">mg/dL</span></p>
                            <p className="text-xs text-orange-500">Range: 3.5 - 7.2</p>
                        </div>
                    </div>

                    {/* Detailed Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Test</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Result</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Unit</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Reference Range</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Object.entries(kidneyData).map(([key, value]) => {
                                    const range = referenceRanges[key];
                                    if (!range) return null;

                                    const statusColor = getStatusColor(value, range);
                                    const statusText = getStatusText(value, range);

                                    return (
                                        <tr key={key} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-gray-700 capitalize">
                                                {key === "eGFR" ? "eGFR" : key}
                                            </td>
                                            <td className="py-3 px-4 font-semibold text-gray-800">{value}</td>
                                            <td className="py-3 px-4 text-gray-500">{range.unit}</td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {range.min} - {range.max} {range.unit}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>

            </ReportsLayout>
        </div>
    );
};

export default KidneyFunction;
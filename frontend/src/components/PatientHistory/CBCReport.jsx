import Title from "antd/es/skeleton/Title";
import ReportsLayout from "../../Layouts/ReportsLayout";

 const CBCReport = ({ patientData }) => {


    return (
      <div className="p-4">

        <ReportsLayout Title="CBC" currentPatientData={patientData}>

          {/* CBC Test Results */}
          <div className="mb-6">

            <Title level={5} className="text-gray-700 m-0 mb-3">Test Results</Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Hemoglobin (Hb)</span>
                  <span className="text-sm font-semibold text-blue-600">12.5 g/dL</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Normal Range</span>
                  <span className="text-xs text-gray-500">11.5 - 16.5 g/dL</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">WBC Count</span>
                  <span className="text-sm font-semibold text-blue-600">7.2 × 10³/µL</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Normal Range</span>
                  <span className="text-xs text-gray-500">4.0 - 11.0 × 10³/µL</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Platelets</span>
                  <span className="text-sm font-semibold text-blue-600">250 × 10³/µL</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Normal Range</span>
                  <span className="text-xs text-gray-500">150 - 400 × 10³/µL</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">RBC Count</span>
                  <span className="text-sm font-semibold text-blue-600">4.8 × 10⁶/µL</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Normal Range</span>
                  <span className="text-xs text-gray-500">4.0 - 5.5 × 10⁶/µL</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Hematocrit (HCT)</span>
                  <span className="text-sm font-semibold text-blue-600">38%</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Normal Range</span>
                  <span className="text-xs text-gray-500">36% - 48%</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">MCV</span>
                  <span className="text-sm font-semibold text-blue-600">85 fL</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-400">Normal Range</span>
                  <span className="text-xs text-gray-500">80 - 100 fL</span>
                </div>
              </div>
            </div>
          </div>

        </ReportsLayout>
      </div>

    );
  };

export default CBCReport
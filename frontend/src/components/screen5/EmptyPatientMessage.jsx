
const EmptyPatientMessage = () => {
    return (
        <div className="flex flex-col justify-center items-center w-full h-full px-5">

            <div className="flex flex-col gap-4 bg-white/20 backdrop-blur-md rounded-2xl p-8 4xl:p-12 text-center shadow-xl border border-blue-200">

                <div className="text-6xl 4xl:text-8xl mb-4 4xl:mb-6">👨‍⚕️</div>
                <h2 className="text-2xl 4xl:text-4xl font-bold text-amber-50 mb-2 4xl:mb-3">
                    No doctor has called any patient yet.
                </h2>
                <p className="text-gray-500 text-lg 4xl:text-2xl mb-4 4xl:mb-6">

                    No Active Consultations
                </p>
                <p className="text-gray-400 text-base 4xl:text-xl">
                    Once a doctor calls a patient, they will appear here.
                </p>

            </div>

        </div>
    )
}

export default EmptyPatientMessage
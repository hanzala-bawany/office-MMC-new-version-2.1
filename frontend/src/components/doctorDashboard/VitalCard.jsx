// VitalCard.jsx
const VitalCard = ({ label, currentValue, lastValue, bgColor, borderColor, textColor, subTextColor , unit, format }) => {


    return (
        <div
            className="flex flex-col p-3 rounded-lg border "
            style={{ backgroundColor: bgColor, borderColor: borderColor }}
        >
            <span className="text-black font-semibold">{label}</span>
            <div className="font-bold" style={{ color: textColor }}>
                { currentValue ? (format ? format(currentValue) : `${currentValue} ${unit || ""} `) : "—"}
            </div>
            <div className="" style={{ color: subTextColor }}>
                { lastValue ? (format ? `${format(lastValue)} (L)` : `${lastValue} ${unit || ""} (L)`) : "—" }
            </div>
        </div>
    );
};

export default VitalCard;
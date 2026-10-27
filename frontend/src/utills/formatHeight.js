// Height normal log feet-inches me samajhte hain: 5'8"
// Naye records 5'8" format me save hote hain. Purane records sirf number ho sakte hain
// (feet ya cm), unhe magnitude se pehchan kar unit laga dete hain.
export const formatHeight = (value) => {
    if (value === null || value === undefined) return "";
    const s = String(value).trim();
    if (!s) return "";
    if (s.includes("'")) return s;              // 5'8"
    const n = parseFloat(s);
    if (!Number.isFinite(n)) return s;
    return n < 10 ? `${s} ft` : `${s} cm`;      // purane plain-number records
};

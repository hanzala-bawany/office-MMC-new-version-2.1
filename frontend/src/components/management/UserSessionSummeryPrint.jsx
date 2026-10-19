import React, { useMemo } from 'react';


const UserSessionSummeryPrint = ({ data }) => {

    const {
        categorySummary = [],
        lessUnpaidDetail = [],
        cancelDetail = [],
        suspiciousTransactions = [],
    } = data || {};

    const fmt = (num) => {
        if (num === undefined || num === null) return '-';
        const n = Number(num);
        const isNeg = n < 0;
        const val = Math.abs(n).toLocaleString('en-IN');
        return isNeg ? `(${val})` : val;
    };

    const totals = useMemo(() => {
        return categorySummary.reduce(
            (acc, cat) => ({
                totSlips: acc.totSlips + (Number(cat.TOTSLIPS) || 0),
                gross: acc.gross + (Number(cat.GROSSAMOUNT) || 0),
                less: acc.less + (Number(cat.LESS) || 0),
                net: acc.net + (Number(cat.NETAMOUNT) || 0),
            }),
            { totSlips: 0, gross: 0, less: 0, net: 0 }
        );
    }, [categorySummary]);


    const groupByPatientType = (rows = []) => {

        if (!Array.isArray(rows) || rows.length === 0) {
            return [];
        }

        const groups = {};  
        rows.forEach((row) => {
            const key = row.PATIENTTYPE || 'OTHER';
            if (!groups[key]) groups[key] = [];   
            groups[key].push(row);                 
        });

        return Object.entries(groups).map(([group, items]) => ({     // Object.entries(groups)  object ko array me convert kar ta he or andar properties ko bhi array me convert kar de ta he (key ko string me) means array of array
            group,
            items,
            total: items.reduce((sum, i) => sum + (Number(i.AMOUNT) || 0), 0),
        }));
        
    };



    const groupedLessUnpaid = useMemo(() => {
        const data = Array.isArray(lessUnpaidDetail) ? lessUnpaidDetail : [];
        return groupByPatientType(data);
    }, [lessUnpaidDetail]);
    const groupedCancel = useMemo(() => groupByPatientType(cancelDetail), [cancelDetail]);


    const lessUnpaidGrandTotal = groupedLessUnpaid.reduce((sum, g) => sum + g.total, 0);
    const cancelGrandTotal = groupedCancel.reduce((sum, g) => sum + g.total, 0);

    return (
        <div className="text-[13px] text-gray-900 font-sans">

            {/* ===== Category Summary ===== */}
            <table className="w-full border-collapse mb-6">
                <thead>
                    <tr className="border-b-2 border-gray-800">
                        <th className="text-left py-1 font-semibold">Catagory</th>
                        <th className="text-right py-1 font-semibold w-20">Tot Slips</th>
                        <th className="text-right py-1 font-semibold w-28">Gross Amount</th>
                        <th className="text-right py-1 font-semibold w-24">Less/UnPaid</th>
                        <th className="text-right py-1 font-semibold w-28">Net Receipt</th>
                    </tr>
                </thead>
                <tbody>
                    {categorySummary.map((cat, i) => (
                        <tr key={i}>
                            <td className="py-0.5">{cat.OPDCATAGORY}</td>
                            <td className="text-right py-0.5">{fmt(cat.TOTSLIPS)}</td>
                            <td className="text-right py-0.5">{fmt(cat.GROSSAMOUNT)}</td>
                            <td className="text-right py-0.5">{fmt(cat.LESS)}</td>
                            <td className="text-right py-0.5">{fmt(cat.NETAMOUNT)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="font-semibold">
                        <td className="py-1"></td>
                        <td className="text-right py-1 border-t-2 border-double border-gray-800">{fmt(totals.totSlips)}</td>
                        <td className="text-right py-1 border-t-2 border-double border-gray-800">{fmt(totals.gross)}</td>
                        <td className="text-right py-1 border-t-2 border-double border-gray-800">{fmt(totals.less)}</td>
                        <td className="text-right py-1 border-t-2 border-double border-gray-800">{fmt(totals.net)}</td>
                    </tr>
                </tfoot>
            </table>

            {/* ===== Less/UnPaid Detail (updated UI) ===== */}
            {groupedLessUnpaid.length > 0 && (
                <div className="mb-6">
                    <div className="text-center font-semibold text-sm mb-3">Less / UnPaid Detail</div>

                    <div className="space-y-3">
                        {groupedLessUnpaid.map((group, gi) => (
                            <div key={gi} className="border border-gray-300 rounded-md overflow-hidden">
                                <div className="flex justify-between items-center px-3 py-1.5 bg-gray-100 border-b border-gray-300">
                                    <span className="font-semibold text-xs tracking-wide">{group.group}</span>
                                    <span className="text-xs text-gray-500">{group.items.length} entr{group.items.length === 1 ? 'y' : 'ies'}</span>
                                </div>
                                <table className="w-full">
                                    <tbody>
                                        {group.items.map((item, ii) => (
                                            <tr key={ii} className={ii !== 0 ? 'border-t border-gray-100' : ''}>
                                                <td className="py-1 px-3 text-xs leading-snug">{item.DESCRIPTION}</td>
                                                <td className="py-1 px-3 text-right whitespace-nowrap font-medium w-24">
                                                    {fmt(item.AMOUNT)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-gray-300">
                                            <td className="py-1 px-3 text-right text-xs font-semibold">Total Of {group.group}</td>
                                            <td className="py-1 px-3 text-right font-semibold w-24">{fmt(group.total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-3 px-3 py-1.5 border-t-2 border-double border-gray-800 font-bold">
                        <span>Total</span>
                        <span>{fmt(lessUnpaidGrandTotal)}</span>
                    </div>
                </div>
            )}

            {/* ===== Cancel Detail ===== */}
            {groupedCancel.length > 0 && (
                <div className="mb-6">
                    <div className="text-center font-semibold text-sm mb-3">Cancel Detail</div>

                    <div className="space-y-3">
                        {groupedCancel.map((group, gi) => (
                            <div key={gi}>
                                <div className="border-b border-gray-400 w-32 mb-1 font-semibold text-xs">{group.group}</div>
                                {group.items.map((item, ii) => (
                                    <div key={ii} className="flex justify-between items-start py-0.5 gap-3 text-xs">
                                        <span>{item.DESCRIPTION}</span>
                                        <span className="whitespace-nowrap font-medium">{fmt(item.AMOUNT)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between border-t-2 border-double border-gray-800 font-semibold mt-1 pt-0.5 text-xs">
                                    <span>Total</span>
                                    <span>{fmt(group.total)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-3 px-3 py-1.5 border-t-2 border-double border-gray-800 font-bold">
                        <span>Total</span>
                        <span>{fmt(cancelGrandTotal)}</span>
                    </div>

                </div>
            )}

            {/* ===== Suspicious Transaction ===== */}
            <div>
                <div className="text-center font-semibold text-sm mb-3">Suspicious Transaction</div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-800">
                            <th className="text-left py-1 font-semibold">First Slip No</th>
                            <th className="text-left py-1 font-semibold">Patient Name</th>
                            <th className="text-right py-1 font-semibold">Gross Amount</th>
                            <th className="text-right py-1 font-semibold">Total Slips</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suspiciousTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center text-gray-400 italic py-2">
                                    No suspicious transactions
                                </td>
                            </tr>
                        ) : (
                            suspiciousTransactions.map((row, i) => (
                                <tr key={i}>
                                    <td className="py-0.5">{row.MINRECEIPT}</td>
                                    <td className="py-0.5">{row.PATIENTNAME}</td>
                                    <td className="text-right py-0.5">{fmt(row.GROSSAMOUNT)}</td>
                                    <td className="text-right py-0.5">{row.TOTSLIPS}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default UserSessionSummeryPrint;
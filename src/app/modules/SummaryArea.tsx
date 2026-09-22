type SummaryAreaProps = {
    uasm: number;
};

function SummaryRow({
    label,
    value,
    muted,
    bold,
}: {
    label: string;
    value: number;
    muted?: boolean;
    bold?: boolean;
}) {
    const valueColor =
        value > 0
            ? "text-green-500"
            : value < 0
              ? "text-red-500"
              : muted
                ? "text-gray-600"
                : "text-white";

    return (
        <div
            className={`flex items-center justify-between border-b border-gray-800 py-2 text-sm ${bold ? "font-semibold" : ""}`}
        >
            <span className="text-gray-400">{label}</span>
            <span className={`tabular-nums ${valueColor}`}>{value}</span>
        </div>
    );
}

export function SummaryArea({ uasm }: SummaryAreaProps) {
    const funds = 0;
    const total = uasm + funds;

    return (
        <div className="flex flex-col p-4">
            <SummaryRow label="UASM" value={uasm} />
            <SummaryRow label="Funds" value={funds} muted />
            <SummaryRow label="Total" value={total} bold />
        </div>
    );
}

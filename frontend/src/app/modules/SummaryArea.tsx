type SummaryAreaProps = {
    uasm: number;
    funds: number;
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
    const isPositive = value > 0;
    const isNegative = value < 0;
    const isMuted = muted ?? false;

    let valueColor = "text-white";

    if (isPositive) {
        valueColor = "text-green-500";
    } else if (isNegative) {
        valueColor = "text-red-500";
    } else if (isMuted) {
        valueColor = "text-gray-600";
    }

    const hasBold = bold ?? false;
    const fontWeight = hasBold ? "font-semibold" : "";
    const baseClassName = "flex items-center justify-between border-b border-gray-800 py-2 text-sm";
    const className = `${baseClassName} ${fontWeight}`;

    const formattedValue = `$${value}`;
    const valueClassName = `tabular-nums ${valueColor}`;

    return (
        <div
            className={className}
        >
            <span className="text-gray-400">{label}</span>
            <span className={valueClassName}>{formattedValue}</span>
        </div>
    );
}

export function SummaryArea({ uasm, funds }: SummaryAreaProps) {
    const uasmTotal = uasm;
    const fundsTotal = funds;
    const combinedTotal = uasmTotal + fundsTotal;

    return (
        <div className="flex flex-col p-4">
            <SummaryRow label="UASM" value={uasmTotal} />
            <SummaryRow label="Funds" value={fundsTotal} />
            <SummaryRow label="Total" value={combinedTotal} bold />
        </div>
    );
}
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

    let valueColor = "text-app-text";

    if (isPositive) {
        valueColor = "text-app-positive";
    } else if (isNegative) {
        valueColor = "text-app-negative";
    } else if (isMuted) {
        valueColor = "text-app-muted-dim";
    }

    const hasBold = bold ?? false;
    const fontWeight = hasBold ? "font-semibold" : "";
    const baseClassName = "flex items-center justify-between border-b border-app-border py-2 text-sm";
    const className = `${baseClassName} ${fontWeight}`;

    const roundedValue = Number(value.toFixed(2));
    const formattedValue = `$${roundedValue}`;
    const valueClassName = `tabular-nums ${valueColor}`;

    return (
        <div
            className={className}
        >
            <span className="text-app-muted">{label}</span>
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
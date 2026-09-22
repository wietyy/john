type SummaryAreaProps = {
    uasm: number;
};

function SummaryRow({
    label,
    value,
    muted,
}: {
    label: string;
    value: number;
    muted?: boolean;
}) {
    return (
        <div className="flex items-center justify-between border-b border-gray-800 py-2 text-sm">
            <span className="text-gray-400">{label}</span>
            <span
                className={`tabular-nums ${muted ? "text-gray-600" : "text-white"}`}
            >
                {value}
            </span>
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
            <SummaryRow label="Total" value={total} />
        </div>
    );
}

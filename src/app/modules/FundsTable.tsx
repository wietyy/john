import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import {
    DeleteIcon,
    EditIcon,
    NoteIcon,
    FIELD_CLASS,
    ICON_BUTTON,
    LABEL_CLASS,
} from "./TransactionTable";

type Fund = {
    id: number;
    title: string;
    amount: number;
    goal: number;
    note?: string;
};

type FundDraft = Omit<Fund, "id">;

type FundsTableProps = {
    isCreating: boolean;
    onCloseCreate: () => void;
    onFundsChange?: (total: number) => void;
};

type FundModalProps = {
    mode: "create" | "edit";
    fund?: Fund;
    onSubmit: (draft: FundDraft) => void;
    onClose: () => void;
};

const FUNDS_STORAGE_KEY = "funds";

const COLUMN_HEADINGS = [
    "Title",
    "Amount",
    "Goal",
    "O/U",
    "Note",
    "Edit",
    "Delete",
];

function readFunds(): Fund[] {
    const stored = localStorage.getItem(FUNDS_STORAGE_KEY);
    if (!stored) return [];

    try {
        const parsed: unknown = JSON.parse(stored);
        return Array.isArray(parsed) ? (parsed as Fund[]) : [];
    } catch {
        return [];
    }
}

function sumFunds(funds: Fund[]) {
    return funds.reduce((total, fund) => total + fund.amount, 0);
}

function FundModal({ mode, fund, onSubmit, onClose }: FundModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [title, setTitle] = useState(() => fund?.title ?? "");
    const [amount, setAmount] = useState(() =>
        fund ? String(fund.amount) : "",
    );
    const [goal, setGoal] = useState(() => (fund ? String(fund.goal) : ""));
    const [note, setNote] = useState(() => fund?.note ?? "");

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function submitFund(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        onSubmit({
            title,
            amount: Number(amount),
            goal: Number(goal),
            note: note.trim() || undefined,
        });
        dialogRef.current?.close();
    }

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            className="m-auto w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-white backdrop:backdrop-blur-md"
        >
            <form className="flex flex-col gap-4" onSubmit={submitFund}>
                <h2 className="text-lg font-semibold">
                    {mode === "create" ? "New Fund" : "Edit Fund"}
                </h2>

                <label className="flex flex-col gap-1">
                    <span className={LABEL_CLASS}>Fund Title</span>
                    <input
                        autoFocus
                        type="text"
                        value={title}
                        required
                        onChange={(event) => setTitle(event.target.value)}
                        className={FIELD_CLASS}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className={LABEL_CLASS}>Amount</span>
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        required
                        onChange={(event) => setAmount(event.target.value)}
                        className={FIELD_CLASS}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className={LABEL_CLASS}>Goal</span>
                    <input
                        type="number"
                        step="0.01"
                        value={goal}
                        required
                        onChange={(event) => setGoal(event.target.value)}
                        className={FIELD_CLASS}
                    />
                </label>

                <label className="flex flex-col gap-1">
                    <span className={LABEL_CLASS}>Note</span>
                    <textarea
                        rows={3}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className={`${FIELD_CLASS} resize-none`}
                    />
                </label>

                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => dialogRef.current?.close()}
                        className="rounded px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
                    >
                        {mode === "create" ? "Create" : "Save"}
                    </button>
                </div>
            </form>
        </dialog>
    );
}

export function FundsTable({
    isCreating,
    onCloseCreate,
    onFundsChange,
}: FundsTableProps) {
    const [funds, setFunds] = useState<Fund[]>(readFunds);
    const [editingFund, setEditingFund] = useState<Fund | null>(null);
    const [visibleNotes, setVisibleNotes] = useState<number[]>([]);

    useEffect(() => {
        onFundsChange?.(sumFunds(funds));
    }, [funds, onFundsChange]);

    function persistFunds(next: Fund[]) {
        localStorage.setItem(FUNDS_STORAGE_KEY, JSON.stringify(next));
        return next;
    }

    function createFund(draft: FundDraft) {
        setFunds((current) => {
            const nextId =
                current.reduce(
                    (highest, fund) => Math.max(highest, fund.id),
                    -1,
                ) + 1;

            return persistFunds([...current, { id: nextId, ...draft }]);
        });
    }

    function updateFund(fundId: number, draft: FundDraft) {
        setFunds((current) =>
            persistFunds(
                current.map((fund) =>
                    fund.id === fundId ? { ...draft, id: fundId } : fund,
                ),
            ),
        );
    }

    function deleteFund(fundId: number) {
        setFunds((current) =>
            persistFunds(
                current.filter((fund) => fund.id !== fundId),
            ),
        );
    }

    function editFund(fundId: number) {
        setEditingFund(
            funds.find((fund) => fund.id === fundId) ?? null,
        );
    }

    function toggleNote(fundId: number) {
        setVisibleNotes((current) =>
            current.includes(fundId)
                ? current.filter((id) => id !== fundId)
                : [...current, fundId],
        );
    }

    function submitFund(draft: FundDraft) {
        if (editingFund) {
            updateFund(editingFund.id, draft);
        } else {
            createFund(draft);
        }
        setEditingFund(null);
        onCloseCreate();
    }

    function closeModal() {
        setEditingFund(null);
        onCloseCreate();
    }

    const modal = editingFund
        ? { mode: "edit" as const, fund: editingFund }
        : isCreating
          ? { mode: "create" as const, fund: undefined }
          : null;

    const sorted = [...funds].sort((a, b) => a.id - b.id);

    const rows: ReactNode[] = [];
    sorted.forEach((fund) => {
        const isNoteVisible = visibleNotes.includes(fund.id);
        const overUnder = fund.amount - fund.goal;
        const overUnderColor =
            overUnder > 0
                ? "text-green-500"
                : overUnder < 0
                  ? "text-red-500"
                  : "text-white";

        rows.push(
            <tr
                key={fund.id}
                className="border-b border-gray-800 transition hover:bg-gray-900/60"
            >
                <td className="px-2 py-2 text-sm">{fund.title}</td>
                <td className="px-2 py-2 text-right text-sm tabular-nums">
                    {fund.amount}
                </td>
                <td className="px-2 py-2 text-right text-sm tabular-nums text-gray-400">
                    {fund.goal}
                </td>
                <td
                    className={`px-2 py-2 text-right text-sm tabular-nums ${overUnderColor}`}
                >
                    {overUnder}
                </td>
                <td className="px-2 py-2 text-center">
                    <button
                        type="button"
                        aria-label="Show note"
                        disabled={!fund.note}
                        onClick={() => toggleNote(fund.id)}
                        className={ICON_BUTTON}
                    >
                        <NoteIcon />
                    </button>
                </td>
                <td className="px-2 py-2 text-center">
                    <button
                        type="button"
                        aria-label="Edit fund"
                        onClick={() => editFund(fund.id)}
                        className={ICON_BUTTON}
                    >
                        <EditIcon />
                    </button>
                </td>
                <td className="px-2 py-2 text-center">
                    <button
                        type="button"
                        aria-label="Delete fund"
                        onClick={() => deleteFund(fund.id)}
                        className="inline-flex size-4 items-center justify-center text-red-500 transition hover:text-red-300"
                    >
                        <DeleteIcon />
                    </button>
                </td>
            </tr>,
        );

        if (isNoteVisible && fund.note) {
            rows.push(
                <tr
                    key={`${fund.id}-note`}
                    className="border-b border-gray-800"
                >
                    <td
                        colSpan={COLUMN_HEADINGS.length}
                        className="bg-gray-900/40 px-2 py-2 text-sm text-gray-400"
                    >
                        {fund.note}
                    </td>
                </tr>,
            );
        }
    });

    return (
        <div className="p-4">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-gray-700 text-xs uppercase tracking-wide text-gray-500">
                        {COLUMN_HEADINGS.map((heading) => (
                            <th
                                key={heading}
                                scope="col"
                                className={
                                    heading === "Title"
                                        ? "px-2 py-2 text-left"
                                        : heading === "Amount" ||
                                            heading === "Goal" ||
                                            heading === "O/U"
                                          ? "px-2 py-2 text-right"
                                          : "px-2 py-2 text-center"
                                }
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {rows.length > 0 ? (
                        rows
                    ) : (
                        <tr className="border-b border-gray-800">
                            <td
                                colSpan={COLUMN_HEADINGS.length}
                                className="px-2 py-6 text-center text-sm text-gray-500"
                            >
                                No funds yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {modal && (
                <FundModal
                    key={
                        modal.mode === "edit"
                            ? `edit-${modal.fund.id}`
                            : "create"
                    }
                    mode={modal.mode}
                    fund={modal.fund}
                    onSubmit={submitFund}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}

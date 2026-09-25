import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import { getScopedStorageKey } from "./ActionBar";
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
    johnId: number;
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

function readFunds(johnId: number): Fund[] {
    const scopedKey = getScopedStorageKey(FUNDS_STORAGE_KEY, johnId);
    const stored = localStorage.getItem(scopedKey);

    const isFirstJohn = johnId === 1;
    const firstJohnKey = FUNDS_STORAGE_KEY;

    const finalStored = stored ?? (isFirstJohn ? localStorage.getItem(firstJohnKey) : null);

    if (!finalStored) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(finalStored);
        const isArray = Array.isArray(parsed);
        return isArray ? (parsed as Fund[]) : [];
    } catch {
        return [];
    }
}

function sumFunds(funds: Fund[]): number {
    const initialTotal = 0;
    const total = funds.reduce((sum, fund) => {
        const fundAmount = fund.amount;
        return sum + fundAmount;
    }, initialTotal);
    return total;
}

function FundModal({ mode, fund, onSubmit, onClose }: FundModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [title, setTitle] = useState(() => {
        const fundTitle = fund?.title;
        return fundTitle ?? "";
    });
    const [amount, setAmount] = useState(() => {
        const hasFund = fund !== undefined;
        if (hasFund) {
            const fundAmount = fund.amount;
            return String(fundAmount);
        }
        return "";
    });
    const [goal, setGoal] = useState(() => {
        const hasFund = fund !== undefined;
        if (hasFund) {
            const fundGoal = fund.goal;
            return String(fundGoal);
        }
        return "";
    });
    const [note, setNote] = useState(() => {
        const fundNote = fund?.note;
        return fundNote ?? "";
    });

    useEffect(() => {
        const dialogElement = dialogRef.current;
        dialogElement?.showModal();
    }, []);

    function submitFund(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const trimmedNote = note.trim();
        const noteOrNull = trimmedNote || undefined;

        const draft: FundDraft = {
            title: title,
            amount: Number(amount),
            goal: Number(goal),
            note: noteOrNull,
        };

        onSubmit(draft);
        const dialogElement = dialogRef.current;
        dialogElement?.close();
    }

    const isEditMode = mode === "edit";
    const dialogTitle = isEditMode ? "Edit Fund" : "New Fund";
    const submitButtonText = isEditMode ? "Save" : "Create";

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            className="m-auto w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-white backdrop:backdrop-blur-md"
        >
            <form className="flex flex-col gap-4" onSubmit={submitFund}>
                <h2 className="text-lg font-semibold">
                    {dialogTitle}
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
                        onClick={() => {
                            const dialogElement = dialogRef.current;
                            dialogElement?.close();
                        }}
                        className="rounded px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
                    >
                        {submitButtonText}
                    </button>
                </div>
            </form>
        </dialog>
    );
}

export function FundsTable({
    johnId,
    isCreating,
    onCloseCreate,
    onFundsChange,
}: FundsTableProps) {
    const initialFunds = readFunds(johnId);
    const [funds, setFunds] = useState<Fund[]>(() => initialFunds);
    const [editingFund, setEditingFund] = useState<Fund | null>(null);
    const [visibleNotes, setVisibleNotes] = useState<number[]>([]);

    useEffect(() => {
        const totalAmount = sumFunds(funds);
        onFundsChange?.(totalAmount);
    }, [funds, onFundsChange]);

    function persistFunds(next: Fund[]): Fund[] {
        const scopedKey = getScopedStorageKey(FUNDS_STORAGE_KEY, johnId);
        const jsonData = JSON.stringify(next);
        localStorage.setItem(scopedKey, jsonData);
        return next;
    }

    function createFund(draft: FundDraft) {
        setFunds((current) => {
            const calculateMaxId = (highest: number, fundItem: Fund) => {
                const fundId = fundItem.id;
                return Math.max(highest, fundId);
            };
            const nextId = current.reduce(calculateMaxId, -1) + 1;

            const newFund = { id: nextId, ...draft };
            const updatedList = [...current, newFund];
            return persistFunds(updatedList);
        });
    }

    function updateFund(fundId: number, draft: FundDraft) {
        setFunds((current) => {
            const updateFundItem = (fundItem: Fund) => {
                const isMatchingId = fundItem.id === fundId;
                if (isMatchingId) {
                    return { ...draft, id: fundId };
                }
                return fundItem;
            };
            const updatedList = current.map(updateFundItem);
            return persistFunds(updatedList);
        });
    }

    function deleteFund(fundId: number) {
        setFunds((current) => {
            const isNotDeleted = (fundItem: Fund) => {
                return fundItem.id !== fundId;
            };
            const updatedList = current.filter(isNotDeleted);
            return persistFunds(updatedList);
        });
    }

    function editFund(fundId: number) {
        const foundFund = funds.find((fundItem) => fundItem.id === fundId);
        const fundOrNull = foundFund ?? null;
        setEditingFund(fundOrNull);
    }

    function toggleNote(fundId: number) {
        setVisibleNotes((current) => {
            const containsId = current.includes(fundId);
            if (containsId) {
                return current.filter((id) => id !== fundId);
            }
            return [...current, fundId];
        });
    }

    function submitFund(draft: FundDraft) {
        const hasEditingFund = editingFund !== null;

        if (hasEditingFund) {
            const editingFundId = editingFund.id;
            updateFund(editingFundId, draft);
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

    const hasEditingFund = editingFund !== null;
    const hasIsCreating = isCreating;

    let modal: { mode: "edit" | "create"; fund: Fund } | null = null;

    if (hasEditingFund) {
        const editFundItem = editingFund;
        modal = { mode: "edit", fund: editFundItem };
    } else if (hasIsCreating) {
        modal = { mode: "create", fund: undefined! };
    } else {
        modal = null;
    }

    const unsortedFunds = funds;
    const sortedFunds = [...unsortedFunds].sort((a, b) => a.id - b.id);

    const rows: ReactNode[] = [];

    sortedFunds.forEach((fund) => {
        const fundId = fund.id;
        const isNoteVisible = visibleNotes.includes(fundId);

        const toggleNoteHandler = () => toggleNote(fundId);
        const editFundHandler = () => editFund(fundId);
        const deleteFundHandler = () => deleteFund(fundId);

        const overUnder = fund.amount - fund.goal;
        const isOver = overUnder > 0;
        const isUnder = overUnder < 0;

        let overUnderColor = "text-white";

        if (isOver) {
            overUnderColor = "text-green-500";
        } else if (isUnder) {
            overUnderColor = "text-red-500";
        }

        const hasNote = fund.note !== undefined;
        const noteText = hasNote ? fund.note! : "";

        rows.push(
            <tr
                key={fundId}
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
                        disabled={!hasNote}
                        onClick={toggleNoteHandler}
                        className={ICON_BUTTON}
                    >
                        <NoteIcon />
                    </button>
                </td>
                <td className="px-2 py-2 text-center">
                    <button
                        type="button"
                        aria-label="Edit fund"
                        onClick={editFundHandler}
                        className={ICON_BUTTON}
                    >
                        <EditIcon />
                    </button>
                </td>
                <td className="px-2 py-2 text-center">
                    <button
                        type="button"
                        aria-label="Delete fund"
                        onClick={deleteFundHandler}
                        className="inline-flex size-4 items-center justify-center text-red-500 transition hover:text-red-300"
                    >
                        <DeleteIcon />
                    </button>
                </td>
            </tr>,
        );

        if (isNoteVisible && hasNote) {
            const noteKey = `${fundId}-note`;

            rows.push(
                <tr
                    key={noteKey}
                    className="border-b border-gray-800"
                >
                    <td
                        colSpan={COLUMN_HEADINGS.length}
                        className="bg-gray-900/40 px-2 py-2 text-sm text-gray-400"
                    >
                        {noteText}
                    </td>
                </tr>,
            );
        }
    });

    function getHeaderClass(heading: string): string {
        const isTitle = heading === "Title";
        const isNumber = heading === "Amount" || heading === "Goal" || heading === "O/U";

        if (isTitle) {
            return "px-2 py-2 text-left";
        }

        if (isNumber) {
            return "px-2 py-2 text-right";
        }

        return "px-2 py-2 text-center";
    }

    const headingCount = COLUMN_HEADINGS.length;
    const hasRows = rows.length > 0;

    return (
        <div className="p-4">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-gray-700 text-xs uppercase tracking-wide text-gray-500">
                        {COLUMN_HEADINGS.map((heading) => {
                            const headerClass = getHeaderClass(heading);
                            return (
                                <th
                                    key={heading}
                                    scope="col"
                                    className={headerClass}
                                >
                                    {heading}
                                </th>
                            );
                        })}
                    </tr>
                </thead>

                <tbody>
                    {hasRows ? (
                        rows
                    ) : (
                        <tr className="border-b border-gray-800">
                            <td
                                colSpan={headingCount}
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
                    key={modal.mode === "edit" ? `edit-${modal.fund.id}` : "create"}
                    mode={modal.mode}
                    fund={modal.fund}
                    onSubmit={submitFund}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}
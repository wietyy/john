import {
    useEffect,
    useRef,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import { getScopedStorageKey } from "./ActionBar";

type Transaction = {
  id: number;
  date: string;
  title: string;
  amount: number;
  note?: string;
};

export type Stats = {
  transactionTotal: number;
  keyNumber: number;
};

function sumTransactions(transactions: Transaction[]) {
  return transactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );
}

type TransactionDraft = Omit<Transaction, "id">;

type TransactionTableProps = {
    johnId: number;
    isCreating: boolean;
    onCloseCreate: () => void;
    onStatsChange?: (stats: Stats) => void;
};

type TransactionModalProps = {
  mode: "create" | "edit";
  transaction?: Transaction;
  onSubmit: (draft: TransactionDraft) => void;
  onClose: () => void;
};

const TRANSACTIONS_STORAGE_KEY = "transactions";
const KEY_NUMBER_STORAGE_KEY = "keyNum";

const COLUMN_HEADINGS = [
  "Date",
  "Transaction Title",
  "Amount",
  "Note",
  "Edit",
  "Delete",
];

export const LABEL_CLASS =
  "block text-xs uppercase tracking-wide text-gray-400";

export const FIELD_CLASS =
  "w-full rounded bg-gray-800 px-2 py-1.5 text-sm text-white outline-none focus:ring-1 focus:ring-gray-500";

export const ICON_BUTTON =
  "inline-flex size-4 items-center justify-center text-gray-400 transition hover:text-white disabled:cursor-not-allowed disabled:text-gray-700";

function readTransactions(johnId: number): Transaction[] {
  const stored =
    localStorage.getItem(getScopedStorageKey(TRANSACTIONS_STORAGE_KEY, johnId)) ??
    (johnId === 1 ? localStorage.getItem(TRANSACTIONS_STORAGE_KEY) : null);

  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as Transaction[]) : [];
  } catch {
    return [];
  }
}

function readKeyNumber(johnId: number): number {
  const stored =
    localStorage.getItem(getScopedStorageKey(KEY_NUMBER_STORAGE_KEY, johnId)) ??
    (johnId === 1 ? localStorage.getItem(KEY_NUMBER_STORAGE_KEY) : null);
  const parsed = Number(stored);
  return stored !== null && Number.isFinite(parsed) ? parsed : 0;
}

function writeKeyNumber(value: number, johnId: number): void {
  const key = getScopedStorageKey(KEY_NUMBER_STORAGE_KEY, johnId);
  localStorage.setItem(key, String(value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function NoteIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M6 2.5h7.5v8.5L10 14.5H6" />
      <path d="M13.5 11h-3.5v3.5" />
      <path d="M2.5 5h3M2.5 8h3M2.5 11h3" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M11.5 2.5l2 2L6 12l-2.5.5L4 10z" />
      <path d="M2.5 14.5h11" />
    </svg>
  );
}

export function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M2.5 4.5h11" />
      <path d="M6.5 4.5V3h3v1.5" />
      <path d="M4 4.5l.8 9h6.4l.8-9" />
      <path d="M7 7.5v4M9 7.5v4" />
    </svg>
  );
}

function TransactionModal({
  mode,
  transaction,
  onSubmit,
  onClose,
}: TransactionModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState(() => transaction?.date ?? today());
  const [title, setTitle] = useState(() => transaction?.title ?? "");
  const [amount, setAmount] = useState(() =>
    transaction ? String(transaction.amount) : "",
  );
  const [note, setNote] = useState(() => transaction?.note ?? "");

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      date,
      title,
      amount: Number(amount),
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
      <form className="flex flex-col gap-4" onSubmit={submitTransaction}>
        <h2 className="text-lg font-semibold">
          {mode === "create" ? "New Transaction" : "Edit Transaction"}
        </h2>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Date</span>
          <input
            type="date"
            value={date}
            required
            disabled={mode === "edit"}
            onChange={(event) => setDate(event.target.value)}
            className={`${FIELD_CLASS} disabled:text-gray-500`}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Transaction Title</span>
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

export function TransactionTable({
  johnId,
  isCreating,
  onCloseCreate,
  onStatsChange,
}: TransactionTableProps) {
  const [transactions, setTransactions] =
    useState<Transaction[]>(() => readTransactions(johnId));
  const [keyNumber, setKeyNumber] = useState(() => readKeyNumber(johnId));
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [isEditingKeyNumber, setIsEditingKeyNumber] = useState(false);
  const [keyNumberDraft, setKeyNumberDraft] = useState(() => String(keyNumber));
  const [visibleNotes, setVisibleNotes] = useState<number[]>([]);

  useEffect(() => {
    onStatsChange?.({
      transactionTotal: sumTransactions(transactions),
      keyNumber,
    });
  }, [transactions, keyNumber, onStatsChange]);

  function persistTransaction(next: Transaction[]) {
    const key = getScopedStorageKey(TRANSACTIONS_STORAGE_KEY, johnId);
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  }

  function createTransaction(draft: TransactionDraft) {
    setTransactions((current) => {
      const nextId =
        current.reduce(
          (highest, transaction) => Math.max(highest, transaction.id),
          -1,
        ) + 1;

      return persistTransaction([...current, { id: nextId, ...draft }]);
    });
  }

  function updateTransaction(transactionId: number, draft: TransactionDraft) {
    setTransactions((current) =>
      persistTransaction(
        current.map((transaction) =>
          transaction.id === transactionId
            ? { ...draft, id: transactionId }
            : transaction,
        ),
      ),
    );
  }

  function deleteTransaction(transactionId: number) {
    setTransactions((current) =>
      persistTransaction(
        current.filter((transaction) => transaction.id !== transactionId),
      ),
    );
  }

  function editKeyNumber() {
    const next = Number(keyNumberDraft);
    const safe = Number.isFinite(next) ? next : 0;
    writeKeyNumber(safe, johnId);
    setKeyNumber(safe);
    setIsEditingKeyNumber(false);
  }

  function startEditingKeyNumber() {
    setKeyNumberDraft(String(keyNumber));
    setIsEditingKeyNumber(true);
  }

  function toggleNote(transactionId: number) {
    setVisibleNotes((current) =>
      current.includes(transactionId)
        ? current.filter((id) => id !== transactionId)
        : [...current, transactionId],
    );
  }

  function submitTransaction(draft: TransactionDraft) {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, draft);
    } else {
      createTransaction(draft);
    }
    setEditingTransaction(null);
    onCloseCreate();
  }

  function closeModal() {
    setEditingTransaction(null);
    onCloseCreate();
  }

  const modal = editingTransaction
    ? { mode: "edit" as const, transaction: editingTransaction }
    : isCreating
      ? { mode: "create" as const, transaction: undefined }
      : null;

  const rows: ReactNode[] = [];
  transactions.forEach((transaction) => {
    const isNoteVisible = visibleNotes.includes(transaction.id);

    rows.push(
      <tr
        key={transaction.id}
        className="border-b border-gray-800 transition hover:bg-gray-900/60"
      >
        <td className="py-2 pr-4 text-right text-sm text-gray-400">
          {transaction.date}
        </td>
        <td className="px-2 py-2 text-sm">{transaction.title}</td>
        <td className="px-2 py-2 text-right text-sm tabular-nums">
          {transaction.amount}
        </td>
        <td className="px-2 py-2 text-center">
          <button
            type="button"
            aria-label="Show note"
            disabled={!transaction.note}
            onClick={() => toggleNote(transaction.id)}
            className={ICON_BUTTON}
          >
            <NoteIcon />
          </button>
        </td>
        <td className="px-2 py-2 text-center">
          <button
            type="button"
            aria-label="Edit transaction"
            onClick={() => setEditingTransaction(transaction)}
            className={ICON_BUTTON}
          >
            <EditIcon />
          </button>
        </td>
        <td className="px-2 py-2 text-center">
          <button
            type="button"
            aria-label="Delete transaction"
            onClick={() => deleteTransaction(transaction.id)}
            className="inline-flex size-4 items-center justify-center text-red-500 transition hover:text-red-300"
          >
            <DeleteIcon />
          </button>
        </td>
      </tr>,
    );

    if (isNoteVisible && transaction.note) {
      rows.push(
        <tr key={`${transaction.id}-note`} className="border-b border-gray-800">
          <td
            colSpan={COLUMN_HEADINGS.length}
            className="bg-gray-900/40 px-2 py-2 text-sm text-gray-400"
          >
            {transaction.note}
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
                  heading === "Date" || heading === "Amount"
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
          <tr className="border-b border-amber-900/50 bg-amber-950/60">
            <td className="py-2 pr-4" />
            <td className="px-2 py-2 text-sm font-semibold text-amber-300">
              Key Number
            </td>
            <td className="px-2 py-2 text-right text-sm font-semibold tabular-nums text-amber-300">
              {isEditingKeyNumber ? (
                <input
                  autoFocus
                  type="number"
                  value={keyNumberDraft}
                  onChange={(event) => setKeyNumberDraft(event.target.value)}
                  onBlur={editKeyNumber}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  className="w-24 rounded bg-gray-700 px-2 py-0.5 text-right text-sm text-white outline-none"
                />
              ) : (
                keyNumber
              )}
            </td>
            <td className="px-2 py-2" />
            <td className="px-2 py-2 text-center">
              <button
                type="button"
                aria-label="Edit key number"
                onClick={startEditingKeyNumber}
                className="inline-flex size-4 items-center justify-center text-amber-400 transition hover:text-amber-200"
              >
                <EditIcon />
              </button>
            </td>
            <td className="px-2 py-2" />
          </tr>

          {rows.length > 0 ? (
            rows
          ) : (
            <tr className="border-b border-gray-800">
              <td
                colSpan={COLUMN_HEADINGS.length}
                className="px-2 py-6 text-center text-sm text-gray-500"
              >
                No transactions yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {modal && (
        <TransactionModal
          key={
            modal.mode === "edit" ? `edit-${modal.transaction.id}` : "create"
          }
          mode={modal.mode}
          transaction={modal.transaction}
          onSubmit={submitTransaction}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

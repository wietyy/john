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

function sumTransactions(transactions: Transaction[]): number {
  const initialTotal = 0;
  const total = transactions.reduce(
    (sum, transaction) => {
      const transactionAmount = transaction.amount;
      return sum + transactionAmount;
    },
    initialTotal,
  );
  return total;
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
  const scopedKey = getScopedStorageKey(TRANSACTIONS_STORAGE_KEY, johnId);
  const stored = localStorage.getItem(scopedKey);

  const isFirstJohn = johnId === 1;
  const firstJohnKey = TRANSACTIONS_STORAGE_KEY;

  const finalStored = stored ?? (isFirstJohn ? localStorage.getItem(firstJohnKey) : null);

  if (!finalStored) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(finalStored);
    const isArray = Array.isArray(parsed);
    return isArray ? (parsed as Transaction[]) : [];
  } catch {
    return [];
  }
}

function readKeyNumber(johnId: number): number {
  const scopedKey = getScopedStorageKey(KEY_NUMBER_STORAGE_KEY, johnId);
  const stored = localStorage.getItem(scopedKey);

  const isFirstJohn = johnId === 1;
  const firstJohnKey = KEY_NUMBER_STORAGE_KEY;

  const finalStored = stored ?? (isFirstJohn ? localStorage.getItem(firstJohnKey) : null);
  const parsed = Number(finalStored);

  const isNotNull = finalStored !== null;
  const isFiniteNumber = Number.isFinite(parsed);
  const isValid = isNotNull && isFiniteNumber;

  return isValid ? parsed : 0;
}

function writeKeyNumber(value: number, johnId: number): void {
  const scopedKey = getScopedStorageKey(KEY_NUMBER_STORAGE_KEY, johnId);
  const stringValue = String(value);
  localStorage.setItem(scopedKey, stringValue);
}

function today(): string {
  const date = new Date();
  const isoString = date.toISOString();
  const datePart = isoString.slice(0, 10);
  return datePart;
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
  const [date, setDate] = useState(() => {
    const transactionDate = transaction?.date;
    const todayDate = today();
    return transactionDate ?? todayDate;
  });
  const [title, setTitle] = useState(() => {
    const transactionTitle = transaction?.title;
    return transactionTitle ?? "";
  });
  const [amount, setAmount] = useState(() => {
    const hasTransaction = transaction !== undefined;
    if (hasTransaction) {
      const transactionAmount = transaction.amount;
      return String(transactionAmount);
    }
    return "";
  });
  const [note, setNote] = useState(() => {
    const transactionNote = transaction?.note;
    return transactionNote ?? "";
  });

  useEffect(() => {
    const dialogElement = dialogRef.current;
    dialogElement?.showModal();
  }, []);

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNote = note.trim();
    const noteOrNull = trimmedNote || undefined;

    const draft: TransactionDraft = {
      date: date,
      title: title,
      amount: Number(amount),
      note: noteOrNull,
    };

    onSubmit(draft);
    const dialogElement = dialogRef.current;
    dialogElement?.close();
  }

  const isEditMode = mode === "edit";
  const dialogTitle = isEditMode ? "Edit Transaction" : "New Transaction";
  const submitButtonText = isEditMode ? "Save" : "Create";

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="m-auto w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-white backdrop:backdrop-blur-md"
    >
      <form className="flex flex-col gap-4" onSubmit={submitTransaction}>
        <h2 className="text-lg font-semibold">
          {dialogTitle}
        </h2>

        <label className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Date</span>
          <input
            type="date"
            value={date}
            required
            disabled={isEditMode}
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

export function TransactionTable({
  johnId,
  isCreating,
  onCloseCreate,
  onStatsChange,
}: TransactionTableProps) {
  const initialTransactions = readTransactions(johnId);
  const initialKeyNumber = readKeyNumber(johnId);

  const [transactions, setTransactions] = useState<Transaction[]>(() => initialTransactions);
  const [keyNumber, setKeyNumber] = useState(() => initialKeyNumber);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditingKeyNumber, setIsEditingKeyNumber] = useState(false);
  const [keyNumberDraft, setKeyNumberDraft] = useState(() => String(keyNumber));
  const [visibleNotes, setVisibleNotes] = useState<number[]>([]);

  useEffect(() => {
    const transactionTotal = sumTransactions(transactions);
    const stats: Stats = {
      transactionTotal: transactionTotal,
      keyNumber: keyNumber,
    };
    onStatsChange?.(stats);
  }, [transactions, keyNumber, onStatsChange]);

  function persistTransaction(next: Transaction[]): Transaction[] {
    const scopedKey = getScopedStorageKey(TRANSACTIONS_STORAGE_KEY, johnId);
    const jsonData = JSON.stringify(next);
    localStorage.setItem(scopedKey, jsonData);
    return next;
  }

  function createTransaction(draft: TransactionDraft) {
    setTransactions((current) => {
      const calculateMaxId = (acc: number, trans: Transaction) => {
        const transId = trans.id;
        return Math.max(acc, transId);
      };
      const nextId = current.reduce(calculateMaxId, -1) + 1;

      const newTransaction = { id: nextId, ...draft };
      const updatedList = [...current, newTransaction];
      return persistTransaction(updatedList);
    });
  }

  function updateTransaction(transactionId: number, draft: TransactionDraft) {
    setTransactions((current) => {
      const updateTransactionItem = (transaction: Transaction) => {
        const isMatchingId = transaction.id === transactionId;
        if (isMatchingId) {
          return { ...draft, id: transactionId };
        }
        return transaction;
      };
      const updatedList = current.map(updateTransactionItem);
      return persistTransaction(updatedList);
    });
  }

  function deleteTransaction(transactionId: number) {
    setTransactions((current) => {
      const isNotDeleted = (transaction: Transaction) => {
        return transaction.id !== transactionId;
      };
      const updatedList = current.filter(isNotDeleted);
      return persistTransaction(updatedList);
    });
  }

  function editKeyNumber() {
    const nextNumber = Number(keyNumberDraft);
    const isFinite = Number.isFinite(nextNumber);
    const safeValue = isFinite ? nextNumber : 0;

    writeKeyNumber(safeValue, johnId);
    setKeyNumber(safeValue);
    setIsEditingKeyNumber(false);
  }

  function startEditingKeyNumber() {
    const stringKey = String(keyNumber);
    setKeyNumberDraft(stringKey);
    setIsEditingKeyNumber(true);
  }

  function toggleNote(transactionId: number) {
    setVisibleNotes((current) => {
      const containsId = current.includes(transactionId);
      if (containsId) {
        return current.filter((id) => id !== transactionId);
      }
      return [...current, transactionId];
    });
  }

  function submitTransaction(draft: TransactionDraft) {
    const hasEditingTransaction = editingTransaction !== null;

    if (hasEditingTransaction) {
      const editingId = editingTransaction.id;
      updateTransaction(editingId, draft);
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

  const hasEditingTransaction = editingTransaction !== null;
  const hasIsCreating = isCreating;

  let modal: { mode: "edit" | "create"; transaction: Transaction } | null = null;

  if (hasEditingTransaction) {
    const editTransaction = editingTransaction;
    modal = { mode: "edit", transaction: editTransaction };
  } else if (hasIsCreating) {
    modal = { mode: "create", transaction: undefined! };
  } else {
    modal = null;
  }

  const rows: ReactNode[] = [];

  transactions.forEach((transaction) => {
    const transactionId = transaction.id;
    const isNoteVisible = visibleNotes.includes(transactionId);

    const toggleNoteHandler = () => toggleNote(transactionId);
    const editTransactionHandler = () => setEditingTransaction(transaction);
    const deleteTransactionHandler = () => deleteTransaction(transactionId);

    const deleteTd = (
      <td className="px-2 py-2 text-center">
        <button
          type="button"
          aria-label="Delete transaction"
          onClick={deleteTransactionHandler}
          className="inline-flex size-4 items-center justify-center text-red-500 transition hover:text-red-300"
        >
          <DeleteIcon />
        </button>
      </td>
    );

    rows.push(
      <tr
        key={transactionId}
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
            onClick={toggleNoteHandler}
            className={ICON_BUTTON}
          >
            <NoteIcon />
          </button>
        </td>
        <td className="px-2 py-2 text-center">
          <button
            type="button"
            aria-label="Edit transaction"
            onClick={editTransactionHandler}
            className={ICON_BUTTON}
          >
            <EditIcon />
          </button>
        </td>
        {deleteTd}
      </tr>,
    );

    const hasNote = transaction.note !== undefined;

    if (isNoteVisible && hasNote) {
      const noteText = transaction.note!;
      const noteKey = `${transactionId}-note`;

      rows.push(
        <tr key={noteKey} className="border-b border-gray-800">
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

  const headingCount = COLUMN_HEADINGS.length;
  const hasRows = rows.length > 0;

  const headerClasses = {
    date: "px-2 py-2 text-right",
    amount: "px-2 py-2 text-right",
    other: "px-2 py-2 text-center",
  };

  const getHeaderClass = (heading: string): string => {
    if (heading === "Date" || heading === "Amount") {
      return headerClasses.date + " " + headerClasses.other;
    }
    return headerClasses.other;
  };

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
              ) : keyNumber}
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

          {hasRows ? (
            rows
          ) : (
            <tr className="border-b border-gray-800">
              <td
                colSpan={headingCount}
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
          key={modal.mode === "edit" ? `edit-${modal.transaction.id}` : "create"}
          mode={modal.mode}
          transaction={modal.transaction}
          onSubmit={submitTransaction}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
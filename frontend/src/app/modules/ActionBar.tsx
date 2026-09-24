import { useEffect, useRef, useState } from "react";

export const JOHN_STORAGE_KEY = "johns";
export const CURRENT_JOHN_ID_STORAGE_KEY = "currentJohnId";
export const TITLE_STORAGE_KEY = "documentTitle";
export const DEFAULT_JOHN_NAME = "JOHN 1";

export type John = {
  id: number;
  name: string;
};

export function getScopedStorageKey(baseKey: string, johnId: number): string {
  return `${baseKey}-${johnId}`;
}

type ActionBarProps = {
  john: John;
  johns: John[];
  onSwitchJohn: (johnId: number) => void;
  onCreateJohn: () => void;
  onRenameJohn: (johnId: number, name: string) => void;
  onDeleteJohn: (johnId: number) => void;
  onNewTransaction?: () => void;
  onNewFund?: () => void;
};

export function ActionBar({
  john,
  johns,
  onSwitchJohn,
  onCreateJohn,
  onRenameJohn,
  onDeleteJohn,
  onNewTransaction,
  onNewFund,
}: ActionBarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(john.name);
  const [isSwitching, setIsSwitching] = useState(false);
  const [loginStatus, setLoginStatus] = useState(false);

  function login() {
    if (localStorage.getItem("loginKey")) {
      setLoginStatus(true);
    } else {
      const key = window.prompt(
        "Enter your secret key. This should be something no one can possibly guess.",
      );
      if (key === null) return;
      localStorage.setItem("loginKey", key);
      setLoginStatus(true);
    }
  }

  useEffect(() => {
    if (isSwitching) {
      dialogRef.current?.showModal();
    }
  }, [isSwitching]);

  function openSwitchModal() {
    setIsSwitching(true);
  }

  function closeSwitchModal() {
    dialogRef.current?.close();
    setIsSwitching(false);
  }

  function requestDeleteJohn() {
    if (johns.length <= 1) {
      window.alert("Can't delete JOHN as there's only one JOHN in the JOHN");
      return;
    }

    const roster = johns
      .map((option) => `${option.id}: ${option.name}`)
      .join("\n");
    const answer = window.prompt(
      `Which JOHN gets axed?\n\n${roster}\n\nEnter an id:`,
    );
    if (answer === null) return;

    const targetId = Number(answer);
    if (!johns.some((option) => option.id === targetId)) {
      window.alert(`No JOHN found with id "${answer}"`);
      return;
    }

    if (!window.confirm("Are you sure?")) return;

    onDeleteJohn(targetId);
    closeSwitchModal();
  }

  function startEditingName() {
    setNameDraft(john.name);
    setIsEditingName(true);
  }

  function saveName() {
    const nextName = nameDraft.trim() || john.name;
    if (nextName !== john.name) {
      onRenameJohn(john.id, nextName);
    }
    setNameDraft(nextName);
    setIsEditingName(false);
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-gray-900 px-4 py-2 text-white">
      {isEditingName ? (
        <input
          autoFocus
          value={nameDraft}
          onChange={(event) => setNameDraft(event.target.value)}
          onBlur={saveName}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="rounded bg-gray-800 px-2 py-0.5 text-lg font-semibold text-white outline-none"
        />
      ) : (
        <h1
          onClick={startEditingName}
          className="cursor-pointer rounded px-2 py-0.5 text-lg font-semibold"
        >
          {john.name} JOHN
        </h1>
      )}

      {!loginStatus && (
        <button
          type="button"
          onClick={login}
          className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
        >
          Login
        </button>
      )}


      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onNewFund}
          className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
        >
          New Fund
        </button>
        <button
          type="button"
          onClick={onNewTransaction}
          className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
        >
          New Transaction
        </button>
        <button
          type="button"
          onClick={openSwitchModal}
          className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
        >
          Switch JOHN
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={closeSwitchModal}
        className="m-auto w-full max-w-md rounded-lg border border-gray-700 bg-gray-900 p-6 text-white backdrop:backdrop-blur-md"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Switch JOHN</h2>
          <div className="flex flex-wrap gap-2">
            {johns.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSwitchJohn(option.id);
                  closeSwitchModal();
                }}
                aria-current={option.id === john.id ? "page" : undefined}
                className={`rounded px-3 py-1 text-sm font-medium ${
                  option.id === john.id
                    ? "bg-white text-gray-950"
                    : "bg-gray-800 text-white hover:bg-gray-600"
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-gray-500">[ESC] exit</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestDeleteJohn}
                className="rounded px-3 py-1 text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeSwitchModal}
                className="rounded px-3 py-1 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onCreateJohn();
                  closeSwitchModal();
                }}
                className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
              >
                New JOHN
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </div>
  );
}

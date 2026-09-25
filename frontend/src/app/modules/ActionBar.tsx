import { useEffect, useRef, useState } from "react";
import { getCloud, setCloud } from "../cloud";

export const JOHN_STORAGE_KEY = "johns";
export const CURRENT_JOHN_ID_STORAGE_KEY = "currentJohnId";
export const TITLE_STORAGE_KEY = "documentTitle";
export const DEFAULT_JOHN_NAME = "JOHN 1";

export type John = {
  id: number;
  name: string;
};

export function getScopedStorageKey(baseKey: string, johnId: number): string {
  const separator = '-';
  const key = `${baseKey}${separator}${johnId}`;
  return key;
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
    const existingKey = localStorage.getItem("loginKey");

    if (existingKey) {
      setLoginStatus(true);
    } else {
      const promptMessage = "Enter your secret key. This should be something no one can possibly guess.";
      const key = window.prompt(promptMessage);

      if (key === null) {
        return;
      }

      const loginKeyStorageKey = "loginKey";
      localStorage.setItem(loginKeyStorageKey, key);
      setLoginStatus(true);
    }
  }

  useEffect(() => {
    if (isSwitching) {
      const dialogElement = dialogRef.current;
      dialogElement?.showModal();
    }
  }, [isSwitching]);

  function openSwitchModal() {
    setIsSwitching(true);
  }

  function closeSwitchModal() {
    const dialogElement = dialogRef.current;
    dialogElement?.close();
    setIsSwitching(false);
  }

  function requestDeleteJohn() {
    const johnsCount = johns.length;

    if (johnsCount <= 1) {
      const alertMessage = "Can't delete JOHN as there's only one JOHN in the JOHN";
      window.alert(alertMessage);
      return;
    }

    const rosterLines: string[] = [];
    const rosterCount = johns.length;

    for (let i = 0; i < rosterCount; i++) {
      const option = johns[i];
      const id = option.id;
      const name = option.name;
      const line = `${id}: ${name}`;
      rosterLines.push(line);
    }

    const separator = '\n';
    const roster = rosterLines.join(separator);

    const promptTitle = "Which JOHN gets axed?";
    const fullMessage = `${promptTitle}\n\n${roster}\n\nEnter an id:`;
    const answer = window.prompt(fullMessage);

    if (answer === null) {
      return;
    }

    const targetId = Number(answer);
    const hasMatchingJohn = johns.some((option) => option.id === targetId);

    if (!hasMatchingJohn) {
      const alertMessage = `No JOHN found with id "${answer}"`;
      window.alert(alertMessage);
      return;
    }

    const confirmMessage = "Are you sure?";
    const isConfirmed = window.confirm(confirmMessage);

    if (!isConfirmed) {
      return;
    }

    onDeleteJohn(targetId);
    closeSwitchModal();
  }

  function startEditingName() {
    const currentName = john.name;
    setNameDraft(currentName);
    setIsEditingName(true);
  }

  function saveName() {
    const trimmedName = nameDraft.trim();
    const nextName = trimmedName || john.name;

    const hasChanged = nextName !== john.name;

    if (hasChanged) {
      const johnId = john.id;
      onRenameJohn(johnId, nextName);
    }

    setNameDraft(nextName);
    setIsEditingName(false);
  }

  function handleWriteCloud() {
    const dataToSend: Record<string, string> = {};
    const storageLength = localStorage.length;

    for (let i = 0; i < storageLength; i++) {
      const storageKey = localStorage.key(i);
      const loginKey = "loginKey";

      if (storageKey && storageKey !== loginKey) {
        const storedValue = localStorage.getItem(storageKey) || "";
        dataToSend[storageKey] = storedValue;
      }
    }

    const loginKey = localStorage.getItem("loginKey") || "";
    const password = loginKey;
    const jsonData = JSON.stringify(dataToSend);
    setCloud(password, jsonData);
    alert("Data synced to cloud successfully!");
  }

  async function handleLoadCloud() {
    const loginKey = localStorage.getItem("loginKey") || "";
    const password = loginKey;
    const data = await getCloud(password);

    try {
      const parsedData = JSON.parse(data);

      for (const key in parsedData) {
        const value = parsedData[key];
        localStorage.setItem(key, value);
      }
    } catch (e) {
      // If parsing fails, just set the raw data
      const fallbackKey = JOHN_STORAGE_KEY;
      localStorage.setItem(fallbackKey, data);
    }

    window.location.reload();
  }

  function handleCreateJohnClick() {
    onCreateJohn();
    closeSwitchModal();
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-gray-900 px-4 py-2 text-white">
      <div className="flex items-center gap-2">
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
        {loginStatus ? (
          <>
            <button
              type="button"
              onClick={handleWriteCloud}
              className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
            >
              Write Cloud
            </button>
            <button
              type="button"
              onClick={handleLoadCloud}
              className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
            >
              Load Cloud
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={login}
            className="rounded bg-gray-700 px-3 py-1 text-sm font-medium text-white hover:bg-gray-600"
          >
            Login
          </button>
        )}
      </div>

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
            {johns.map((option) => {
              const optionId = option.id;
              const optionName = option.name;
              const isActive = option.id === john.id;
              const buttonClasses = isActive
                ? "rounded px-3 py-1 text-sm font-medium bg-white text-gray-950"
                : "rounded px-3 py-1 text-sm font-medium bg-gray-800 text-white hover:bg-gray-600";

              return (
                <button
                  key={optionId}
                  type="button"
                  onClick={() => {
                    onSwitchJohn(optionId);
                    closeSwitchModal();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={buttonClasses}
                >
                  {optionName}
                </button>
              );
            })}
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
                onClick={handleCreateJohnClick}
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
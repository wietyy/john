import { useEffect, useRef, useState } from "react";

export const JOHN_STORAGE_KEY = "johns";
export const CURRENT_JOHN_ID_STORAGE_KEY = "currentJohnId";
export const TITLE_STORAGE_KEY = "documentTitle";
export const DEFAULT_JOHN_NAME = "Your";

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
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onWriteCloud: () => void;
  onLoadCloud: () => void;
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
  isLoggedIn,
  onLogin,
  onLogout,
  onWriteCloud,
  onLoadCloud,
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

  function handleCreateJohnClick() {
    onCreateJohn();
    closeSwitchModal();
  }

  function saveLocalFile() {
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

    const jsonData = JSON.stringify(dataToSend, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "john-data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function loadLocalFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsedData = JSON.parse(reader.result as string);
          for (const key in parsedData) {
            const value = parsedData[key];
            localStorage.setItem(key, value);
          }
          window.location.reload();
        } catch (e) {
          alert("Failed to load file: invalid JSON format");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-app-panel px-4 py-2 text-app-text">
      <div className="flex items-center gap-2">
      <img src="https://raw.githubusercontent.com/wietyy/john/main/frontend/src/mike.svg" alt="prison mike :D" className="w-6 h-6" />
        {isEditingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(event) => setNameDraft(event.target.value)}
            onBlur={saveName}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            className="rounded bg-app-raised px-2 py-0.5 text-lg font-semibold text-app-text outline-none"
          />
        ) : (
          <h1
            onClick={startEditingName}
            className="cursor-pointer rounded px-2 py-0.5 text-lg font-semibold"
          >
            {john.name} JOHN
          </h1>
        )}
        {isLoggedIn ? (
          <>
            <button
              type="button"
              onClick={onWriteCloud}
              className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
            >
              Write Cloud
            </button>
            <button
              type="button"
              onClick={onLoadCloud}
              className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
            >
              Load Cloud
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onLogin}
            className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
          >
            Login
          </button>
        )}
        <button
          type="button"
          onClick={() => { saveLocalFile(); }}
          className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
        >
          Save File
        </button>
        <button
          type="button"
          onClick={() => { loadLocalFile(); }}
          className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
        >
          Load File
        </button>

      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onNewFund}
          className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
        >
          New Fund
        </button>
        <button
          type="button"
          onClick={onNewTransaction}
          className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
        >
          New Transaction
        </button>
        <button
          type="button"
          onClick={openSwitchModal}
          className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
        >
          Switch JOHN
        </button>
      </div>

      <dialog
        ref={dialogRef}
        onClose={closeSwitchModal}
        className="m-auto w-full max-w-md rounded-lg border border-app-border-strong bg-app-panel p-6 text-app-text backdrop:backdrop-blur-md"
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Switch JOHN</h2>
          <div className="flex flex-wrap gap-2">
            {johns.map((option) => {
              const optionId = option.id;
              const optionName = option.name;
              const isActive = option.id === john.id;
              const buttonClasses = isActive
                ? "rounded px-3 py-1 text-sm font-medium bg-app-accent text-app-accent-text"
                : "rounded px-3 py-1 text-sm font-medium bg-app-raised text-app-text hover:bg-app-button-hover";

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
            <div className="text-xs text-app-muted-dim">[ESC] exit</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={requestDeleteJohn}
                className="rounded px-3 py-1 text-sm font-medium text-app-danger hover:bg-app-raised hover:text-app-danger-hover"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeSwitchModal}
                className="rounded px-3 py-1 text-sm font-medium text-app-text-soft hover:bg-app-raised hover:text-app-text"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateJohnClick}
                className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
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
import { useEffect, useRef, useState } from "react";
import { decrypt, encrypt } from "@wietyy/easycrypt";
import { getCloud, setCloud } from "./cloud";
import {
    ActionBar,
    CURRENT_JOHN_ID_STORAGE_KEY,
    DEFAULT_JOHN_NAME,
    JOHN_STORAGE_KEY,
    TITLE_STORAGE_KEY,
    getScopedStorageKey,
    type John,
} from "./modules/ActionBar";
import { FundsTable } from "./modules/FundsTable";
import { SummaryArea } from "./modules/SummaryArea";
import { TransactionTable, type Stats } from "./modules/TransactionTable";

const NOTES_STORAGE_KEY = "textNotes";
const THEME_STORAGE_KEY = "theme";

const THEMES = [
    { id: "dark", label: "Dark" },
    { id: "midnight", label: "Midnight" },
    { id: "oled", label: "OLED" },
    { id: "light", label: "Light" },
] as const;

type Theme = (typeof THEMES)[number]["id"];

const LOGIN_KEY_STORAGE_KEY = "loginKey";
const CLOUD_AUTO_LOADED_STORAGE_KEY = "cloudAutoLoaded";
const CLOUD_SYNC_INTERVAL_MS = 15 * 1000;

type CloudStatus = "off" | "idle" | "saving" | "saved" | "error";

const CLOUD_STATUS_LABELS: Record<CloudStatus, string> = {
    off: "Cloud sync off",
    idle: "Cloud sync on",
    saving: "Saving to cloud…",
    saved: "Saved to cloud",
    error: "Cloud save failed",
};

const CLOUD_STATUS_DOT_CLASSES: Record<CloudStatus, string> = {
    off: "bg-app-muted-dim",
    idle: "bg-app-muted",
    saving: "bg-app-warn-icon",
    saved: "bg-app-positive",
    error: "bg-app-negative",
};

function readLoginKey(): string {
    const storedKey = localStorage.getItem(LOGIN_KEY_STORAGE_KEY);
    return storedKey ?? "";
}

function collectLocalData(): Record<string, string> {
    const collected: Record<string, string> = {};
    const storageLength = localStorage.length;

    for (let index = 0; index < storageLength; index++) {
        const storageKey = localStorage.key(index);
        const isLoginKey = storageKey === LOGIN_KEY_STORAGE_KEY;

        if (storageKey && !isLoginKey) {
            const storedValue = localStorage.getItem(storageKey) ?? "";
            collected[storageKey] = storedValue;
        }
    }

    return collected;
}

async function decodeCloudData(encryptedData: string, password: string): Promise<string> {
    const startsWithBrace = encryptedData.startsWith("{");

    if (startsWithBrace) {
        return encryptedData;
    }

    const decryptedData = await decrypt(encryptedData, password);
    return decryptedData;
}

function applyCloudData(parsedData: Record<string, string>): boolean {
    let hasChanged = false;

    for (const key in parsedData) {
        const value = parsedData[key];
        const stringValue = String(value);
        const currentValue = localStorage.getItem(key);

        if (currentValue !== stringValue) {
            localStorage.setItem(key, stringValue);
            hasChanged = true;
        }
    }

    return hasChanged;
}

function readTheme(): Theme {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const storedTheme = THEMES.find((themeOption) => themeOption.id === stored);
    const theme: Theme = storedTheme ? storedTheme.id : "dark";
    return theme;
}

function isJohn(value: unknown): value is John {
    const isObject = typeof value === "object";
    const isNotNull = value !== null;

    if (!isObject || !isNotNull) {
        return false;
    }

    const candidate = value as Record<string, unknown>;

    const isIdNumber = typeof candidate.id === "number";
    const isIdInteger = Number.isInteger(candidate.id);
    const isIdPositive = candidate.id !== null && (candidate.id as number) > 0;
    const isNameString = typeof candidate.name === "string";

    const trimmedName = candidate.name as string;
    const hasName = trimmedName.trim().length > 0;

    return isIdNumber && isIdInteger && isIdPositive && isNameString && hasName;
}

function readJohns(): John[] {
    const stored = localStorage.getItem(JOHN_STORAGE_KEY);

    if (!stored) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(stored);

        const isArray = Array.isArray(parsed);
        if (!isArray) {
            return [];
        }

        const allJohns = parsed.filter(isJohn);

        const uniqueJohns = allJohns.filter((john, index) => {
            const findIndex = allJohns.findIndex((candidate) => candidate.id === john.id);
            return findIndex === index;
        });

        return uniqueJohns;
    } catch {
        return [];
    }
}

function readCurrentJohnId(johns: John[]): number {
    const stored = localStorage.getItem(CURRENT_JOHN_ID_STORAGE_KEY);
    const parsed = Number(stored);
    const isInteger = Number.isInteger(parsed);
    const isPositive = parsed !== null && parsed > 0;

    const johnsHaveId = johns.some((john) => john.id === parsed);

    if (isInteger && isPositive && johnsHaveId) {
        return parsed;
    }

    const firstJohn = johns[0];
    const firstJohnId = firstJohn?.id;
    return firstJohnId ?? 1;
}

function initializeJohns(): John[] {
    const existingJohns = readJohns();

    if (existingJohns.length > 0) {
        return existingJohns;
    }

    const titleStored = localStorage.getItem(TITLE_STORAGE_KEY);
    const trimmedTitle = titleStored?.trim();
    const name = trimmedTitle || DEFAULT_JOHN_NAME;

    const john: John = { id: 1, name };
    const jsonData = JSON.stringify([john]);
    localStorage.setItem(JOHN_STORAGE_KEY, jsonData);

    return [john];
}

function readNotes(johnId: number): string {
    const scopedKey = getScopedStorageKey(NOTES_STORAGE_KEY, johnId);
    const scoped = localStorage.getItem(scopedKey);

    if (scoped !== null) {
        return scoped;
    }

    const isFirstJohn = johnId === 1;

    if (isFirstJohn) {
        const firstNotes = localStorage.getItem(NOTES_STORAGE_KEY);
        return firstNotes ?? "";
    }

    return "";
}

function persistNotes(notes: string, johnId: number): void {
    const scopedKey = getScopedStorageKey(NOTES_STORAGE_KEY, johnId);
    localStorage.setItem(scopedKey, notes);
}

export function App() {
    const initializedJohns = initializeJohns();
    const [johns, setJohns] = useState<John[]>(() => initializedJohns);
    const [currentJohnId, setCurrentJohnId] = useState(() =>
        readCurrentJohnId(johns),
    );
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingFunds, setIsCreatingFunds] = useState(false);

    const [loginKey, setLoginKey] = useState<string>(readLoginKey);
    const [cloudStatus, setCloudStatus] = useState<CloudStatus>(() => {
        const hasLoginKey = readLoginKey().length > 0;
        const initialStatus: CloudStatus = hasLoginKey ? "idle" : "off";
        return initialStatus;
    });

    const lastSavedPayloadRef = useRef<string>("");

    const initializedNotes = readNotes(currentJohnId);
    const [notes, setNotes] = useState(() => initializedNotes);

    const initializedTheme = readTheme();
    const [theme, setTheme] = useState<Theme>(() => initializedTheme);
    const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
    const themeDialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    useEffect(() => {
        if (isThemePickerOpen) {
            const dialogElement = themeDialogRef.current;
            dialogElement?.showModal();
        }
    }, [isThemePickerOpen]);

    useEffect(() => {
        const password = readLoginKey();
        const isLoggedIn = password.length > 0;

        if (!isLoggedIn) {
            return;
        }

        const hasAutoLoaded = sessionStorage.getItem(CLOUD_AUTO_LOADED_STORAGE_KEY);

        if (hasAutoLoaded) {
            return;
        }

        sessionStorage.setItem(CLOUD_AUTO_LOADED_STORAGE_KEY, "true");
        void loadCloud(password, false);
    }, []);

    useEffect(() => {
        const isLoggedIn = loginKey.length > 0;

        if (!isLoggedIn) {
            return;
        }

        const saveInterval = window.setInterval(() => {
            void saveCloud(loginKey, false);
        }, CLOUD_SYNC_INTERVAL_MS);

        const clearSaveInterval = () => window.clearInterval(saveInterval);
        return clearSaveInterval;
    }, [loginKey]);

    useEffect(() => {
        function handleBeforeUnload(event: BeforeUnloadEvent): void {
            const hasLoginKey = readLoginKey().length > 0;

            if (!hasLoginKey) {
                return;
            }

            const currentPayload = JSON.stringify(collectLocalData());
            const hasUnsyncedChanges = currentPayload !== lastSavedPayloadRef.current;

            if (hasUnsyncedChanges) {
                event.preventDefault();
                event.returnValue = "";
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload);

        const removeBeforeUnloadListener = () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
        return removeBeforeUnloadListener;
    }, []);

    const initialStats: Stats = {
        transactionTotal: 0,
        keyNumber: 0,
    };
    const [stats, setStats] = useState<Stats>(() => initialStats);

    const [fundsTotal, setFundsTotal] = useState(0);

    const foundJohn = johns.find((john) => john.id === currentJohnId);
    const firstJohn = johns[0];
    const currentJohn = foundJohn ?? firstJohn;

    const [lastJohnId, setLastJohnId] = useState(currentJohnId);

    if (lastJohnId !== currentJohnId) {
        setLastJohnId(currentJohnId);

        const newNotes = readNotes(currentJohnId);
        setNotes(newNotes);

        const resetStats: Stats = {
            transactionTotal: 0,
            keyNumber: 0,
        };
        setStats(resetStats);

        setFundsTotal(0);
        setIsCreating(false);
        setIsCreatingFunds(false);
    }

    function openThemePicker(): void {
        setIsThemePickerOpen(true);
    }

    function closeThemePicker(): void {
        const dialogElement = themeDialogRef.current;
        dialogElement?.close();
        setIsThemePickerOpen(false);
    }

    function selectJohn(johnId: number): void {
        const isSameJohn = johnId === currentJohnId;

        if (isSameJohn) {
            return;
        }

        setCurrentJohnId(johnId);
    }

    function createJohn(): void {
        const allIds = johns.map((john) => john.id);
        const maxId = Math.max(0, ...allIds);
        const nextId = maxId + 1;

        const john: John = { id: nextId, name: `JOHN ${nextId}` };

        setJohns((current) => {
            const next = [...current, john];
            const jsonData = JSON.stringify(next);
            localStorage.setItem(JOHN_STORAGE_KEY, jsonData);
            return next;
        });

        const nextIdString = String(nextId);
        localStorage.setItem(CURRENT_JOHN_ID_STORAGE_KEY, nextIdString);
        setCurrentJohnId(nextId);
    }

    function renameJohn(johnId: number, name: string): void {
        const trimmedName = name.trim();
        const nextName = trimmedName || DEFAULT_JOHN_NAME;

        setJohns((current) => {
            const renameItem = (johnItem: John) => {
                const isSameId = johnItem.id === johnId;
                if (isSameId) {
                    return { ...johnItem, name: nextName };
                }
                return johnItem;
            };

            const next = current.map(renameItem);
            const jsonData = JSON.stringify(next);
            localStorage.setItem(JOHN_STORAGE_KEY, jsonData);
            return next;
        });
    }

    function deleteJohn(johnId: number): void {
        const johnsCount = johns.length;

        if (johnsCount <= 1) {
            return;
        }

        const next = johns.filter((john) => john.id !== johnId);
        const jsonData = JSON.stringify(next);
        localStorage.setItem(JOHN_STORAGE_KEY, jsonData);
        setJohns(next);

        const keysToRemove = [NOTES_STORAGE_KEY, "transactions", "keyNum", "funds"];

        for (const key of keysToRemove) {
            const scopedKey = getScopedStorageKey(key, johnId);
            localStorage.removeItem(scopedKey);
        }

        const isSameCurrent = johnId === currentJohnId;

        if (isSameCurrent) {
            const isFirstJohnPresent = next.some((john) => john.id === 1);

            if (isFirstJohnPresent) {
                const fallbackId = 1;
                localStorage.setItem(CURRENT_JOHN_ID_STORAGE_KEY, String(fallbackId));
                setCurrentJohnId(fallbackId);
            } else {
                const fallbackId = next[0].id;
                localStorage.setItem(CURRENT_JOHN_ID_STORAGE_KEY, String(fallbackId));
                setCurrentJohnId(fallbackId);
            }
        }
    }

    function login(): void {
        const existingKey = readLoginKey();

        if (existingKey) {
            setLoginKey(existingKey);
            setCloudStatus("idle");
            return;
        }

        const promptMessage = "Enter your secret key. This should be something no one can possibly guess.";
        const key = window.prompt(promptMessage);

        if (key === null) {
            return;
        }

        localStorage.setItem(LOGIN_KEY_STORAGE_KEY, key);
        lastSavedPayloadRef.current = "";
        setLoginKey(key);
        setCloudStatus("idle");
    }

    function logout(): void {
        const confirmMessage = "Are you sure you want to log out?";
        const isConfirmed = window.confirm(confirmMessage);

        if (!isConfirmed) {
            return;
        }

        localStorage.removeItem(LOGIN_KEY_STORAGE_KEY);
        sessionStorage.removeItem(CLOUD_AUTO_LOADED_STORAGE_KEY);
        lastSavedPayloadRef.current = "";
        setLoginKey("");
        setCloudStatus("off");
    }

    async function saveCloud(password: string, isManual: boolean): Promise<void> {
        const dataToSend = collectLocalData();
        const jsonData = JSON.stringify(dataToSend);
        const hasAlreadySaved = jsonData === lastSavedPayloadRef.current;

        if (hasAlreadySaved && !isManual) {
            return;
        }

        setCloudStatus("saving");

        try {
            const encryptedData = await encrypt(jsonData, password);
            const result = await setCloud(password, encryptedData);
            const isSuccess = result === "success";

            if (isSuccess) {
                lastSavedPayloadRef.current = jsonData;
                setCloudStatus("saved");
            } else {
                setCloudStatus("error");
            }
        } catch {
            setCloudStatus("error");
        }
    }

    async function loadCloud(password: string, isManual: boolean): Promise<void> {
        try {
            const encryptedData = await getCloud(password);
            const hasCloudData = encryptedData.length > 0;

            if (!hasCloudData) {
                if (isManual) {
                    window.alert("No cloud data found for this key.");
                }
                return;
            }

            const decryptedData = await decodeCloudData(encryptedData, password);
            const parsedData = JSON.parse(decryptedData) as Record<string, string>;
            const hasChanged = applyCloudData(parsedData);

            // What is in local storage now matches the cloud copy, so the refresh
            // below shouldn't trip the unsaved changes warning.
            const loadedPayload = JSON.stringify(collectLocalData());
            lastSavedPayloadRef.current = loadedPayload;

            if (hasChanged || isManual) {
                window.location.reload();
            }
        } catch {
            if (isManual) {
                window.alert("Failed to load cloud data.");
            }
        }
    }

    function handleWriteCloud(): void {
        void saveCloud(loginKey, true);
    }

    function handleLoadCloud(): void {
        void loadCloud(loginKey, true);
    }

    const currentJohnExists = currentJohn !== null && currentJohn !== undefined;

    if (!currentJohnExists) {
        return null;
    }

    const uasm = stats.transactionTotal + stats.keyNumber;

    const currentThemeLabel = THEMES.find((themeOption) => themeOption.id === theme)?.label ?? "Dark";
    const cloudStatusLabel = CLOUD_STATUS_LABELS[cloudStatus];
    const cloudStatusDotClass = CLOUD_STATUS_DOT_CLASSES[cloudStatus];
    const isLoggedIn = loginKey.length > 0;

    const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nextNotes = event.target.value;
        setNotes(nextNotes);
        persistNotes(nextNotes, currentJohn.id);
    };

    return (
        <div className="flex min-h-screen flex-col bg-app-bg text-app-text">
            <ActionBar
                john={currentJohn}
                johns={johns}
                isLoggedIn={isLoggedIn}
                onLogin={login}
                onLogout={logout}
                onWriteCloud={handleWriteCloud}
                onLoadCloud={handleLoadCloud}
                onSwitchJohn={selectJohn}
                onCreateJohn={createJohn}
                onRenameJohn={renameJohn}
                onDeleteJohn={deleteJohn}
                onNewTransaction={() => setIsCreating(true)}
                onNewFund={() => setIsCreatingFunds(true)}
            />

            <div className="grid flex-1 grid-cols-2 grid-rows-[2fr_3fr] gap-3 p-4">
                <section className="overflow-auto rounded border border-app-border bg-app-panel/40">
                    <SummaryArea
                        uasm={uasm}
                        funds={fundsTotal}
                    />
                </section>

                <section className="overflow-hidden rounded border border-app-border bg-app-panel/40">
                    <textarea
                        value={notes}
                        placeholder="Notes..."
                        onChange={handleNotesChange}
                        className="h-full w-full resize-none bg-transparent p-3 text-sm text-app-text outline-none"
                    />
                </section>

                <section className="overflow-auto rounded border border-app-border bg-app-panel/40">
                    <TransactionTable
                        key={currentJohn.id}
                        johnId={currentJohn.id}
                        isCreating={isCreating}
                        onCloseCreate={() => setIsCreating(false)}
                        onStatsChange={setStats}
                    />
                </section>
                <section className="overflow-auto rounded border border-app-border bg-app-panel/40">
                    <FundsTable
                        key={currentJohn.id}
                        johnId={currentJohn.id}
                        isCreating={isCreatingFunds}
                        onCloseCreate={() => setIsCreatingFunds(false)}
                        onFundsChange={setFundsTotal}
                    />
                </section>
            </div>

            <footer className="flex items-center justify-between gap-4 border-t border-app-border bg-app-panel px-4 py-1 text-xs text-app-muted">
                <span className="flex items-center gap-1.5" role="status">
                    <span aria-hidden="true" className={`size-1.5 rounded-full ${cloudStatusDotClass}`} />
                    {cloudStatusLabel}
                </span>

                <button
                    type="button"
                    onClick={openThemePicker}
                    title="Choose theme"
                    aria-haspopup="dialog"
                    className="flex items-center gap-1.5 rounded-full border border-app-border bg-app-raised px-2.5 py-0.5 font-medium text-app-muted transition-colors hover:border-app-border-strong hover:text-app-text"
                >
                    <span aria-hidden="true" className="size-2 rounded-full bg-app-accent" />
                    {currentThemeLabel}
                </button>
            </footer>

            <dialog
                ref={themeDialogRef}
                onClose={closeThemePicker}
                className="m-auto w-full max-w-sm rounded-lg border border-app-border-strong bg-app-panel p-5 text-app-text backdrop:backdrop-blur-md"
            >
                <div className="flex flex-col gap-3">
                    <h2 className="text-lg font-semibold">Theme</h2>

                    <div className="-mx-1 flex max-h-72 flex-col gap-1 overflow-y-auto px-1">
                        {THEMES.map((option) => {
                            const optionId = option.id;
                            const optionLabel = option.label;
                            const isActive = optionId === theme;

                            const rowClassName = isActive
                                ? "flex items-center justify-between gap-3 rounded border border-app-border-strong bg-app-raised px-3 py-2 text-left"
                                : "flex items-center justify-between gap-3 rounded border border-transparent px-3 py-2 text-left hover:bg-app-raised";

                            const selectHandler = () => setTheme(optionId);

                            return (
                                <button
                                    key={optionId}
                                    type="button"
                                    onClick={selectHandler}
                                    aria-pressed={isActive}
                                    className={rowClassName}
                                >
                                    <span className="text-sm font-medium">{optionLabel}</span>

                                    <span
                                        aria-hidden="true"
                                        data-theme={optionId}
                                        className="flex shrink-0 items-center gap-1"
                                    >
                                        <span className="size-6 rounded border border-app-border bg-app-bg" />
                                        <span className="size-6 rounded border border-app-border bg-app-panel" />
                                        <span className="size-6 rounded border border-app-border bg-app-raised" />
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-app-muted-dim">[ESC] exit</div>
                        <button
                            type="button"
                            onClick={closeThemePicker}
                            className="rounded bg-app-button px-3 py-1 text-sm font-medium text-app-text hover:bg-app-button-hover"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
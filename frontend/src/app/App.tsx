import { useEffect, useRef, useState } from "react";
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
    { id: "dark", label: "Dark", description: "Charcoal panels on a near-black base" },
    { id: "midnight", label: "Midnight", description: "Blue-black with cool grey surfaces" },
    { id: "oled", label: "OLED", description: "Pure black with grey shades" },
    { id: "light", label: "Light", description: "Bright surfaces with dark text" },
] as const;

type Theme = (typeof THEMES)[number]["id"];

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

    const currentJohnExists = currentJohn !== null && currentJohn !== undefined;

    if (!currentJohnExists) {
        return null;
    }

    const uasm = stats.transactionTotal + stats.keyNumber;

    const currentThemeLabel = THEMES.find((themeOption) => themeOption.id === theme)?.label ?? "Dark";

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
                onSwitchJohn={selectJohn}
                onCreateJohn={createJohn}
                onRenameJohn={renameJohn}
                onDeleteJohn={deleteJohn}
                onNewTransaction={() => setIsCreating(true)}
                onNewFund={() => setIsCreatingFunds(true)}
            />

            <div className="grid flex-1 grid-cols-2 grid-rows-[2fr_3fr] gap-3 p-4 pb-14">
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

            <button
                type="button"
                onClick={openThemePicker}
                title="Choose theme"
                aria-haspopup="dialog"
                className="fixed right-4 bottom-4 z-20 flex items-center gap-1.5 rounded-full border border-app-border bg-app-panel/70 px-3 py-1.5 text-xs font-medium text-app-muted shadow-sm backdrop-blur transition-colors hover:border-app-border-strong hover:text-app-text"
            >
                <span aria-hidden="true" className="size-2 rounded-full bg-app-accent" />
                {currentThemeLabel}
            </button>

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
                            const optionDescription = option.description;
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
                                    <span className="flex flex-col">
                                        <span className="text-sm font-medium">{optionLabel}</span>
                                        <span className="text-xs text-app-muted">
                                            {optionDescription}
                                        </span>
                                    </span>

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
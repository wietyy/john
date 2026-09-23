import { useState } from "react";
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

function isJohn(value: unknown): value is John {
    if (typeof value !== "object" || value === null) return false;

    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.id === "number" &&
        Number.isInteger(candidate.id) &&
        candidate.id > 0 &&
        typeof candidate.name === "string" &&
        candidate.name.trim().length > 0
    );
}

function readJohns(): John[] {
    const stored = localStorage.getItem(JOHN_STORAGE_KEY);
    if (!stored) return [];

    try {
        const parsed: unknown = JSON.parse(stored);
        if (!Array.isArray(parsed)) return [];

        const johns = parsed.filter(isJohn);
        return johns.filter(
            (john, index) => johns.findIndex((candidate) => candidate.id === john.id) === index,
        );
    } catch {
        return [];
    }
}

function readCurrentJohnId(johns: John[]): number {
    const stored = localStorage.getItem(CURRENT_JOHN_ID_STORAGE_KEY);
    const parsed = Number(stored);

    if (
        Number.isInteger(parsed) &&
        parsed > 0 &&
        johns.some((john) => john.id === parsed)
    ) {
        return parsed;
    }

    return johns[0]?.id ?? 1;
}

function initializeJohns(): John[] {
    const existing = readJohns();
    if (existing.length > 0) return existing;

    const name = localStorage.getItem(TITLE_STORAGE_KEY)?.trim() || DEFAULT_JOHN_NAME;
    const john: John = { id: 1, name };
    localStorage.setItem(JOHN_STORAGE_KEY, JSON.stringify([john]));
    return [john];
}

function readNotes(johnId: number): string {
    const scoped = localStorage.getItem(getScopedStorageKey(NOTES_STORAGE_KEY, johnId));
    if (scoped !== null) return scoped;

    return johnId === 1 ? localStorage.getItem(NOTES_STORAGE_KEY) ?? "" : "";
}

function persistNotes(notes: string, johnId: number): void {
    localStorage.setItem(getScopedStorageKey(NOTES_STORAGE_KEY, johnId), notes);
}

export function App() {
    const [johns, setJohns] = useState<John[]>(initializeJohns);
    const [currentJohnId, setCurrentJohnId] = useState(() =>
        readCurrentJohnId(johns),
    );
    const [isCreating, setIsCreating] = useState(false);
    const [isCreatingFunds, setIsCreatingFunds] = useState(false);

    const [notes, setNotes] = useState(() => readNotes(currentJohnId));
    const [stats, setStats] = useState<Stats>({
        transactionTotal: 0,
        keyNumber: 0,
    });
    const [fundsTotal, setFundsTotal] = useState(0);

    const currentJohn =
        johns.find((john) => john.id === currentJohnId) ?? johns[0];

    const [lastJohnId, setLastJohnId] = useState(currentJohnId);
    if (lastJohnId !== currentJohnId) {
        setLastJohnId(currentJohnId);
        setNotes(readNotes(currentJohnId));
        setStats({ transactionTotal: 0, keyNumber: 0 });
        setFundsTotal(0);
        setIsCreating(false);
        setIsCreatingFunds(false);
    }

    function selectJohn(johnId: number): void {
        if (johnId === currentJohnId) return;
        setCurrentJohnId(johnId);
    }

    function createJohn(): void {
        const nextId = Math.max(0, ...johns.map((john) => john.id)) + 1;
        const john: John = { id: nextId, name: `JOHN ${nextId}` };

        setJohns((current) => {
            const next = [...current, john];
            localStorage.setItem(JOHN_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
        localStorage.setItem(CURRENT_JOHN_ID_STORAGE_KEY, String(nextId));
        setCurrentJohnId(nextId);
    }

    function renameJohn(johnId: number, name: string): void {
        const nextName = name.trim() || DEFAULT_JOHN_NAME;

        setJohns((current) => {
            const next = current.map((john) =>
                john.id === johnId ? { ...john, name: nextName } : john,
            );
            localStorage.setItem(JOHN_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }

    if (!currentJohn) return null;

    return (
        <div className="flex min-h-screen flex-col bg-gray-950 text-white">
            <ActionBar
                john={currentJohn}
                johns={johns}
                onSwitchJohn={selectJohn}
                onCreateJohn={createJohn}
                onRenameJohn={renameJohn}
                onNewTransaction={() => setIsCreating(true)}
                onNewFund={() => setIsCreatingFunds(true)}
            />

            <div className="grid flex-1 grid-cols-2 grid-rows-[2fr_3fr] gap-3 p-4">
                <section className="overflow-auto rounded border border-gray-800 bg-gray-900/40">
                    <SummaryArea
                        uasm={stats.transactionTotal + stats.keyNumber}
                        funds={fundsTotal}
                    />
                </section>

                <section className="overflow-hidden rounded border border-gray-800 bg-gray-900/40">
                    <textarea
                        value={notes}
                        placeholder="Notes..."
                        onChange={(event) => {
                            const nextNotes = event.target.value;
                            setNotes(nextNotes);
                            persistNotes(nextNotes, currentJohn.id);
                        }}
                        className="h-full w-full resize-none bg-transparent p-3 text-sm text-white outline-none"
                    />
                </section>

                <section className="overflow-auto rounded border border-gray-800 bg-gray-900/40">
                    <TransactionTable
                        key={currentJohn.id}
                        johnId={currentJohn.id}
                        isCreating={isCreating}
                        onCloseCreate={() => setIsCreating(false)}
                        onStatsChange={setStats}
                    />
                </section>
                <section className="overflow-auto rounded border border-gray-800 bg-gray-900/40">
                    <FundsTable
                        key={currentJohn.id}
                        johnId={currentJohn.id}
                        isCreating={isCreatingFunds}
                        onCloseCreate={() => setIsCreatingFunds(false)}
                        onFundsChange={setFundsTotal}
                    />
                </section>
            </div>
        </div>
    );
}

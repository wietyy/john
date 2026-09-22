import { useState } from "react";
import { ActionBar } from "./modules/ActionBar";
import { SummaryArea } from "./modules/SummaryArea";
import { TransactionTable, type Stats } from "./modules/TransactionTable";

const NOTES_STORAGE_KEY = "textNotes";

function readNotes(): string {
    return localStorage.getItem(NOTES_STORAGE_KEY) ?? "";
}

export function App() {
    const [isCreating, setIsCreating] = useState(false);
    const [notes, setNotes] = useState<string>(readNotes);
    const [stats, setStats] = useState<Stats>({
        transactionTotal: 0,
        keyNumber: 0,
    });

    return (
        <div className="flex min-h-screen flex-col bg-gray-950 text-white">
            <ActionBar onNewTransaction={() => setIsCreating(true)} />

            <div className="grid flex-1 grid-cols-2 grid-rows-[2fr_3fr] gap-3 p-4">
                <section className="overflow-auto rounded border border-gray-800 bg-gray-900/40">
                    <SummaryArea
                        uasm={stats.transactionTotal + stats.keyNumber}
                    />
                </section>

                <section className="overflow-hidden rounded border border-gray-800 bg-gray-900/40">
                    <textarea
                        value={notes}
                        placeholder="Notes..."
                        onChange={(event) => {
                            setNotes(event.target.value);
                            localStorage.setItem(
                                NOTES_STORAGE_KEY,
                                event.target.value,
                            );
                        }}
                        className="h-full w-full resize-none bg-transparent p-3 text-sm text-white outline-none"
                    />
                </section>

                <section className="overflow-auto rounded border border-gray-800 bg-gray-900/40">
                    <TransactionTable
                        isCreating={isCreating}
                        onCloseCreate={() => setIsCreating(false)}
                        onStatsChange={setStats}
                    />
                </section>

                <section className="rounded border border-gray-800 bg-gray-900/40" />
            </div>
        </div>
    );
}

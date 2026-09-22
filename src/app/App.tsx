import { useState } from "react";
import { ActionBar } from "./modules/ActionBar";
import { TransactionTable } from "./modules/TransactionTable";

export function App() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      <ActionBar onNewTransaction={() => setIsCreating(true)} />

      <div className="grid flex-1 grid-cols-2 grid-rows-[2fr_3fr] gap-3 p-4">
        <section className="rounded border border-gray-800 bg-gray-900/40" />

        <section className="rounded border border-gray-800 bg-gray-900/40" />

        <section className="overflow-auto rounded border border-gray-800 bg-gray-900/40">
          <TransactionTable
            isCreating={isCreating}
            onCloseCreate={() => setIsCreating(false)}
          />
        </section>

        <section className="rounded border border-gray-800 bg-gray-900/40" />
      </div>
    </div>
  );
}

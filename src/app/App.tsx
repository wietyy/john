import { useState } from "react";
import { ActionBar } from "./modules/ActionBar";
import { TransactionTable } from "./modules/TransactionTable";

export function App() {
    const [isCreating, setIsCreating] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-gray-950 text-white">
            <ActionBar onNewTransaction={() => setIsCreating(true)} />
            <TransactionTable
                isCreating={isCreating}
                onCloseCreate={() => setIsCreating(false)}
            />
        </div>
    );
}

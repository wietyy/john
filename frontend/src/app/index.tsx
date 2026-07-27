import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Data } from "../data";

interface Transaction {
  date: string;
  memo: string;
  amount: number;
}

interface Fund {
  fundName: string;
  amount: number;
  goal: number;
  description: string;
}

interface Account {
  accountName: string;
  keyNumber: number;
  transactions: Transaction[];
  funds: Fund[];
}

export default function App() {
  const navigate = useNavigate();
  const storeRef = useRef<Data | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [account, setAccount] = useState<Account>({
    accountName: "Checking",
    keyNumber: 0,
    transactions: [{ date: "", memo: "", amount: 0 }],
    funds: [],
  });

  const [editCell, setEditCell] = useState<{
    row: number;
    col: "date" | "memo" | "amount";
  } | null>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [loaded, setLoaded] = useState(false);
  const [showDesc, setShowDesc] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const apikey = localStorage.getItem("apikey");
    if (!apikey) {
      navigate("/login");
      return;
    }

    const store = new Data(apikey);
    storeRef.current = store;

    async function load() {
      try {
        await store.pullServer();
      } catch {
        store.loadLocal();
      }
      if (store.accounts.length > 0) {
        setAccount(store.accounts[0] as Account);
      }
      setLoaded(true);
    }
    load();
  }, [navigate]);

  useEffect(() => {
    if (!loaded) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      const store = storeRef.current;
      if (!store) return;
      if (store.accounts.length === 0) {
        store.accounts.push(account);
      } else {
        store.accounts[0] = account;
      }
      store.saveLocal();
      try {
        await store.pushServer();
      } catch {
        // silent fail — server may be down
      }
    }, 1000);
    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [account, loaded]);

  const txnSum = account.transactions.reduce((s, t) => s + t.amount, 0);
  const nsm = account.keyNumber + txnSum;
  const fundsTotal = account.funds.reduce((s, f) => s + f.amount, 0);
  const total = nsm + fundsTotal;

  function setAccountField<K extends keyof Account>(key: K, value: Account[K]) {
    setAccount(prev => ({ ...prev, [key]: value }));
  }

  function updateTransaction(
    index: number,
    field: "date" | "memo" | "amount",
    value: string | number,
  ) {
    setAccount(prev => {
      const txns = [...prev.transactions];
      txns[index] = { ...txns[index], [field]: value };
      const last = txns[txns.length - 1];
      if (last.date || last.memo || last.amount !== 0) {
        txns.push({ date: "", memo: "", amount: 0 });
      }
      return { ...prev, transactions: txns };
    });
  }

  function addTransaction() {
    setAccount(prev => ({
      ...prev,
      transactions: [...prev.transactions, { date: "", memo: "", amount: 0 }],
    }));
  }

  function adjustKeyNumber(value: number) {
    setAccount(prev => ({ ...prev, keyNumber: value }));
  }

  function startEdit(index: number, col: "date" | "memo" | "amount") {
    setEditCell({ row: index, col });
    setTimeout(() => {
      inputRefs.current.get(`${index}-${col}`)?.focus();
    }, 0);
  }

  function addFund() {
    setAccount(prev => ({
      ...prev,
      funds: [
        ...prev.funds,
        { fundName: "", amount: 0, goal: 0, description: "" },
      ],
    }));
  }

  function updateFund(
    index: number,
    field: "fundName" | "amount" | "goal" | "description",
    value: string | number,
  ) {
    setAccount(prev => {
      const funds = [...prev.funds];
      funds[index] = { ...funds[index], [field]: value };
      return { ...prev, funds };
    });
  }

  function removeFund(index: number) {
    setAccount(prev => ({
      ...prev,
      funds: prev.funds.filter((_, i) => i !== index),
    }));
  }

  function handleLogout() {
    localStorage.removeItem("apikey");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/10 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold tracking-tight">JOHN</h1>
          <nav className="flex items-center gap-6">
            <span className="text-sm text-gray-400">Checking</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-4 py-1.5 text-sm text-gray-300 transition hover:border-white/30 hover:text-white"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <input
            type="text"
            value={account.accountName}
            onChange={e => setAccountField("accountName", e.target.value)}
            className="bg-transparent text-2xl font-bold tracking-tight text-white outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top-Left: Account Details */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">
              Account Details
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-mono text-sm text-gray-300">NSM</span>
                <span className="font-mono text-sm text-blue-400">
                  ${nsm.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="font-mono text-sm text-gray-300">Funds</span>
                <span className="font-mono text-sm text-green-400">
                  ${fundsTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-sm font-semibold text-white">
                  Total
                </span>
                <span className="font-mono text-sm font-semibold text-white">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          {/* Top-Right: Empty */}
          <section className="flex items-center justify-center rounded-2xl border border-dashed border-white/5 bg-white/[0.02] p-6">
            <p className="text-sm text-gray-600">More coming soon</p>
          </section>

          {/* Bottom-Left: Transactions */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">
              Transactions
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-2 font-mono">Date</th>
                    <th className="px-3 py-2 font-mono">Memo</th>
                    <th className="px-3 py-2 text-right font-mono">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Key Number row */}
                  <tr className="border-b border-blue-500/20 bg-blue-500/5">
                    <td className="px-3 py-2 font-mono text-xs text-blue-400">
                      Key Number
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        step="0.01"
                        value={account.keyNumber || ""}
                        onChange={e =>
                          adjustKeyNumber(parseFloat(e.target.value) || 0)
                        }
                        className="w-full rounded bg-gray-900 px-2 py-1 font-mono text-sm text-white outline-none ring-1 ring-blue-500/50 transition focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-mono text-sm text-blue-400">
                        {account.keyNumber >= 0 ? "+" : ""}
                        {account.keyNumber.toFixed(2)}
                      </span>
                    </td>
                  </tr>

                  {/* Regular transactions */}
                  {account.transactions.map((t, i) => (
                    <tr
                      key={i}
                      className="group border-b border-white/5 transition last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-1.5">
                        {editCell?.row === i && editCell?.col === "date" ? (
                          <input
                            ref={el => {
                              if (el)
                                inputRefs.current.set(`${i}-date`, el);
                            }}
                            type="text"
                            value={t.date}
                            onChange={e =>
                              updateTransaction(i, "date", e.target.value)
                            }
                            onBlur={() => setEditCell(null)}
                            onKeyDown={e => {
                              if (e.key === "Enter") startEdit(i, "memo");
                              if (e.key === "Tab") {
                                e.preventDefault();
                                startEdit(i, "memo");
                              }
                            }}
                            className="w-full rounded bg-gray-900 px-2 py-1 font-mono text-sm text-white outline-none ring-1 ring-blue-500"
                          />
                        ) : (
                          <span
                            onClick={() => startEdit(i, "date")}
                            className="block cursor-text px-2 py-1 font-mono text-sm text-gray-300 transition hover:text-white"
                          >
                            {t.date || (
                              <span className="text-gray-600 italic">
                                empty
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5">
                        {editCell?.row === i && editCell?.col === "memo" ? (
                          <input
                            ref={el => {
                              if (el)
                                inputRefs.current.set(`${i}-memo`, el);
                            }}
                            type="text"
                            value={t.memo}
                            onChange={e =>
                              updateTransaction(i, "memo", e.target.value)
                            }
                            onBlur={() => setEditCell(null)}
                            onKeyDown={e => {
                              if (e.key === "Enter") startEdit(i, "amount");
                              if (e.key === "Tab") {
                                e.preventDefault();
                                startEdit(i, "amount");
                              }
                            }}
                            className="w-full rounded bg-gray-900 px-2 py-1 font-mono text-sm text-white outline-none ring-1 ring-blue-500"
                          />
                        ) : (
                          <span
                            onClick={() => startEdit(i, "memo")}
                            className="block cursor-text px-2 py-1 font-mono text-sm text-gray-300 transition hover:text-white"
                          >
                            {t.memo || (
                              <span className="text-gray-600 italic">
                                empty
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-right">
                        {editCell?.row === i && editCell?.col === "amount" ? (
                          <input
                            ref={el => {
                              if (el)
                                inputRefs.current.set(`${i}-amount`, el);
                            }}
                            type="number"
                            step="0.01"
                            value={t.amount || ""}
                            onChange={e =>
                              updateTransaction(
                                i,
                                "amount",
                                parseFloat(e.target.value) || 0,
                              )
                            }
                            onBlur={() => setEditCell(null)}
                            onKeyDown={e => {
                              if (e.key === "Enter" || e.key === "Tab") {
                                e.preventDefault();
                                setEditCell(null);
                                const last =
                                  account.transactions
                                    .length - 1;
                                if (i === last) addTransaction();
                              }
                            }}
                            className="w-28 rounded bg-gray-900 px-2 py-1 text-right font-mono text-sm text-white outline-none ring-1 ring-blue-500"
                          />
                        ) : (
                          <span
                            onClick={() => startEdit(i, "amount")}
                            className="block cursor-text px-2 py-1 font-mono text-sm text-gray-300 transition hover:text-white"
                          >
                            {t.amount !== 0
                              ? `$${t.amount.toFixed(2)}`
                              : "$0.00"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addTransaction}
              className="mt-3 w-full rounded-lg border border-dashed border-white/10 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 transition hover:border-white/30 hover:text-gray-300"
            >
              + New Transaction
            </button>
          </section>

          {/* Bottom-Right: Funds */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-gray-500">
              Funds
            </h2>
            <div className="space-y-3">
              {account.funds.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-600">
                  No funds yet
                </p>
              )}
              {account.funds.map((f, i) => {
                const ou = f.amount - f.goal;
                return (
                  <div
                    key={i}
                    className="group rounded-xl border border-white/10 bg-gray-900/50 p-4 transition hover:border-white/20"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={f.fundName}
                        onChange={e =>
                          updateFund(i, "fundName", e.target.value)
                        }
                        placeholder="Fund name"
                        className="flex-1 bg-transparent font-mono text-sm text-white outline-none placeholder:text-gray-600"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={f.amount || ""}
                        onChange={e =>
                          updateFund(
                            i,
                            "amount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        placeholder="$0.00"
                        className="w-24 rounded-lg border border-white/10 bg-gray-950 px-2 py-1 text-right font-mono text-sm text-white outline-none transition focus:border-blue-500"
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                          O/U
                        </span>
                        <span
                          className={`w-16 rounded-lg border px-2 py-1 text-center font-mono text-xs ${
                            ou > 0
                              ? "border-green-500/30 bg-green-500/10 text-green-400"
                              : ou < 0
                                ? "border-red-500/30 bg-red-500/10 text-red-400"
                                : "border-white/10 bg-gray-950 text-gray-500"
                          }`}
                        >
                          {ou > 0 ? "+" : ""}
                          {ou.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                          Goal
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={f.goal || ""}
                          onChange={e =>
                            updateFund(
                              i,
                              "goal",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-16 rounded-lg border border-white/10 bg-gray-950 px-2 py-1 text-center font-mono text-xs text-white outline-none transition focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() =>
                          setShowDesc(prev => ({
                            ...prev,
                            [i]: !prev[i],
                          }))
                        }
                        className="rounded-md p-1 text-gray-600 opacity-0 transition hover:text-gray-300 group-hover:opacity-100"
                        title="Toggle description"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeFund(i)}
                        className="rounded-md p-1 text-gray-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                        title="Remove fund"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    {showDesc[i] && (
                      <textarea
                        value={f.description}
                        onChange={e =>
                          updateFund(i, "description", e.target.value)
                        }
                        placeholder="Add a note..."
                        rows={2}
                        className="mt-3 w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 font-mono text-xs text-gray-400 outline-none transition placeholder:text-gray-700 focus:border-blue-500"
                      />
                    )}
                  </div>
                );
              })}
              <button
                onClick={addFund}
                className="w-full rounded-lg border border-dashed border-white/10 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 transition hover:border-white/30 hover:text-gray-300"
              >
                + New Fund
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

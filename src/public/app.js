"use strict";

const STORAGE_KEY = "john";
const DEFAULT_ACCOUNT = () => ({
    accountName: "Checking",
    keyNumber: 0,
    transactions: [{ date: "", memo: "", amount: 0 }],
    funds: [],
});

let accounts = [DEFAULT_ACCOUNT()];
let current = 0;
let loaded = false;
let pushTimer = null;
const act = () => accounts[current];
const accountName = document.getElementById("account-name");
const txnBody = document.getElementById("txn-body");
const fundList = document.getElementById("fund-list");

const nsmEl = document.getElementById("nsm");
const fundsTotalEl = document.getElementById("funds-total");
const grandTotalEl = document.getElementById("grand-total");

async function pullServer() {
    const apikey = localStorage.getItem("apikey");
    const res = await fetch(`/api/getdata?apikey=${encodeURIComponent(apikey)}`);
    if (!res.ok) throw new Error(await res.text());
    return JSON.parse(await res.text());
}

function saveLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: 1,
        apikey: localStorage.getItem("apikey"),
        accounts,
    }));
}

function pushServer() {
    const apikey = localStorage.getItem("apikey");
    return fetch("/api/setdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            apikey,
            data: JSON.stringify({
                version: 1,
                apikey,
                accounts,
            }),
        }),
    });
}

function schedulePush() {
    if (!loaded) return;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(async () => {
        saveLocal();
        try {
            await pushServer();
        } catch {
            // silent fail — server may be down
        }
    }, 1000);
}

function fmt(n) {
    n = Number(n) || 0;
    const sign = n < 0 ? "-" : n >= 0 && n > 0 ? "+" : "";
    return `${n.toFixed(2)}`;
}

function fmtMoney(n) {
    n = Number(n) || 0;
    const sign = n < 0 ? "-$" : "$";
    return `${sign}${Math.abs(n).toFixed(2)}`;
}

// ---------- rendering ----------

function renderTotals() {
    const txnSum = act().transactions.reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const nsm = (Number(act().keyNumber) || 0) + txnSum;
    const fundsTotal = act().funds.reduce((s, f) => s + (Number(f.amount) || 0), 0);
    nsmEl.textContent = fmtMoney(nsm);
    fundsTotalEl.textContent = fmtMoney(fundsTotal);
    grandTotalEl.textContent = fmtMoney(nsm + fundsTotal);
}

function renderTransactions() {
    txnBody.innerHTML = "";

    // Key Number row
    const knRow = document.createElement("tr");
    knRow.className = "keynumber-row";
    knRow.innerHTML = `
        <td class="mono-blue" style="font-size:0.75rem">Key Number</td>
        <td><input type="number" step="0.01" class="keynumber-input" value="${Number(act().keyNumber) || ""}"></td>
        <td style="text-align:right"><span class="mono-blue">${act().keyNumber >= 0 ? "+" : ""}${Number(act().keyNumber || 0).toFixed(2)}</span></td>
    `;
    const knInput = knRow.querySelector(".keynumber-input");
    knInput.addEventListener("input", () => {
        act().keyNumber = parseFloat(knInput.value) || 0;
        knRow.querySelector("td:last-child span").textContent =
            `${act().keyNumber >= 0 ? "+" : ""}${act().keyNumber.toFixed(2)}`;
        renderTotals();
        schedulePush();
    });
    txnBody.appendChild(knRow);

    // Transactions
    act().transactions.forEach((t, i) => {
        const tr = document.createElement("tr");
        tr.className = "tx-row";

        const makeCell = (col) => {
            const td = document.createElement("td");
            td.style.padding = "0.4rem 0.75rem";

            const span = document.createElement("span");
            span.className = "tx-cell";
            if (col === "amount") span.classList.add("amount");
            if (!t[col] || (col === "amount" && !t[col])) span.classList.add("empty");
            span.textContent = col === "amount"
                ? `$${(Number(t.amount) || 0).toFixed(2)}`
                : (t[col] || "empty");
            span.tabIndex = 0;

            span.addEventListener("click", () => startEdit(i, col));
            span.addEventListener("keydown", (e) => {
                if (e.key === "Enter") { e.preventDefault(); startEdit(i, col); }
            });

            td.appendChild(span);
            return td;
        };

        tr.appendChild(makeCell("date"));
        tr.appendChild(makeCell("memo"));
        tr.appendChild(makeCell("amount"));
        txnBody.appendChild(tr);
    });
}

function startEdit(row, col) {
    const t = act().transactions[row];
    if (!t) return;
    const trs = txnBody.querySelectorAll("tr.tx-row");
    const tr = trs[row];
    if (!tr) return;
    const td = tr.children[col === "date" ? 0 : col === "memo" ? 1 : 2];
    const span = td.querySelector(".tx-cell");
    if (!span) return;

    const input = document.createElement("input");
    input.type = col === "amount" ? "number" : "text";
    if (col === "amount") {
        input.step = "0.01";
        input.className = "tx-input amount-input";
        input.style.textAlign = "right";
    } else {
        input.className = "tx-input";
    }
    input.value = t[col] ?? "";
    td.innerHTML = "";
    td.appendChild(input);
    input.focus();

    let committed = false;
    const commit = () => {
        if (committed) return;
        committed = true;
        if (col === "amount") t.amount = parseFloat(input.value) || 0;
        else t[col] = input.value;

        // auto-add a fresh row if the last one has data
        const last = act().transactions[act().transactions.length - 1];
        if (last && (last.date || last.memo || last.amount !== 0)) {
            act().transactions.push({ date: "", memo: "", amount: 0 });
        }
        renderTransactions();
        renderTotals();
        schedulePush();
    };

    input.addEventListener("blur", commit);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            commit();
            const next = { date: "memo", memo: "amount" }[col];
            if (next) startEdit(row, next);
            else startEdit(row + 1, "date");
        }
        if (e.key === "Escape") {
            e.preventDefault();
            committed = true;
            td.innerHTML = "";
            td.appendChild(span);
        }
    });
}

function renderFunds() {
    fundList.innerHTML = "";
    if (act().funds.length === 0) {
        const p = document.createElement("p");
        p.className = "no-funds";
        p.textContent = "No funds yet";
        fundList.appendChild(p);
    }

    act().funds.forEach((f, i) => {
        const ou = (Number(f.amount) || 0) - (Number(f.goal) || 0);
        const card = document.createElement("div");
        card.className = "fund-card";

        const row = document.createElement("div");
        row.className = "fund-row";

        const name = document.createElement("input");
        name.className = "fund-name";
        name.type = "text";
        name.placeholder = "Fund name";
        name.value = f.fundName;
        name.addEventListener("input", () => {
            f.fundName = name.value;
            schedulePush();
        });

        const amount = document.createElement("input");
        amount.className = "small-input amount-input-num";
        amount.type = "number";
        amount.step = "0.01";
        amount.value = Number(f.amount) || "";
        amount.addEventListener("input", () => {
            f.amount = parseFloat(amount.value) || 0;
            if (ouBadge) {
                const o = f.amount - (Number(f.goal) || 0);
                ouBadge.textContent = (o > 0 ? "+" : "") + o.toFixed(2);
                ouBadge.className = "ou-badge " + (o > 0 ? "pos" : o < 0 ? "neg" : "");
            }
            renderTotals();
            schedulePush();
        });

        const ouWrap = document.createElement("div");
        ouWrap.style.cssText = "display:flex;align-items:center;gap:0.25rem";
        const ouLabel = document.createElement("span");
        ouLabel.className = "ou-label";
        ouLabel.textContent = "O/U";
        const ouBadge = document.createElement("span");
        ouBadge.className = "ou-badge " + (ou > 0 ? "pos" : ou < 0 ? "neg" : "");
        ouBadge.textContent = (ou > 0 ? "+" : "") + ou.toFixed(2);
        ouWrap.appendChild(ouLabel);
        ouWrap.appendChild(ouBadge);

        const goalWrap = document.createElement("div");
        goalWrap.style.cssText = "display:flex;align-items:center;gap:0.25rem";
        const goalLabel = document.createElement("span");
        goalLabel.className = "ou-label";
        goalLabel.textContent = "Goal";
        const goal = document.createElement("input");
        goal.className = "small-input goal-input";
        goal.type = "number";
        goal.step = "0.01";
        goal.value = Number(f.goal) || "";
        goal.addEventListener("input", () => {
            f.goal = parseFloat(goal.value) || 0;
            const o = (Number(f.amount) || 0) - f.goal;
            ouBadge.textContent = (o > 0 ? "+" : "") + o.toFixed(2);
            ouBadge.className = "ou-badge " + (o > 0 ? "pos" : o < 0 ? "neg" : "");
            schedulePush();
        });
        goalWrap.appendChild(goalLabel);
        goalWrap.appendChild(goal);

        const descBtn = document.createElement("button");
        descBtn.className = "icon-btn";
        descBtn.title = "Toggle description";
        descBtn.innerHTML = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
        descBtn.addEventListener("click", () => {
            if (desc) desc.remove();
            else {
                const d = makeDesc();
                card.appendChild(d);
            }
        });

        let desc = null;
        const makeDesc = () => {
            desc = document.createElement("textarea");
            desc.className = "fund-desc";
            desc.rows = 2;
            desc.placeholder = "Add a note...";
            desc.value = f.description || "";
            desc.addEventListener("input", () => {
                f.description = desc.value;
                schedulePush();
            });
            return desc;
        };

        const removeBtn = document.createElement("button");
        removeBtn.className = "icon-btn danger";
        removeBtn.title = "Remove fund";
        removeBtn.innerHTML = `<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>`;
        removeBtn.addEventListener("click", () => {
            act().funds.splice(i, 1);
            renderFunds();
            renderTotals();
            schedulePush();
        });

        row.appendChild(name);
        row.appendChild(amount);
        row.appendChild(ouWrap);
        row.appendChild(goalWrap);
        row.appendChild(descBtn);
        row.appendChild(removeBtn);
        card.appendChild(row);
        fundList.appendChild(card);
    });
}

function renderAll() {
    act().accountName = act().accountName || "Account";
    accountName.value = act().accountName;
    document.getElementById("nav-account").textContent = act().accountName;
    renderTransactions();
    renderFunds();
    renderTotals();
}

function renderTabs() {
    const tabs = document.getElementById("tabs");
    tabs.innerHTML = "";
    accounts.forEach((acc, i) => {
        const tab = document.createElement("button");
        tab.className = "tab" + (i === current ? " active" : "");
        tab.title = acc.accountName || "Account " + (i + 1);

        const name = document.createElement("span");
        name.className = "tab-name";
        name.textContent = acc.accountName || "Account " + (i + 1);
        tab.appendChild(name);

        if (accounts.length > 1) {
            const x = document.createElement("span");
            x.className = "tab-x";
            x.textContent = "×";
            x.addEventListener("click", (e) => {
                e.stopPropagation();
                removeAccount(i);
            });
            tab.appendChild(x);
        }

        tab.addEventListener("click", () => switchAccount(i));
        tabs.appendChild(tab);
    });
}

function switchAccount(i) {
    if (i === current) return;
    current = i;
    renderAll();
    renderTabs();
    schedulePush();
}

function removeAccount(i) {
    if (accounts.length <= 1) return;
    if (!confirm(`Delete account "${accounts[i].accountName || "Untitled"}"?`)) return;
    accounts.splice(i, 1);
    if (current >= accounts.length) current = accounts.length - 1;
    else if (i < current) current--;
    renderAll();
    renderTabs();
    schedulePush();
}

// ---------- events ----------

accountName.addEventListener("input", () => {
    act().accountName = accountName.value;
    document.getElementById("nav-account").textContent = accountName.value;
    const activeTab = document.querySelector(".tab.active .tab-name");
    if (activeTab) activeTab.textContent = accountName.value || "Account " + (current + 1);
    schedulePush();
});

document.getElementById("add-txn").addEventListener("click", () => {
    act().transactions.push({ date: "", memo: "", amount: 0 });
    renderTransactions();
    renderTotals();
    schedulePush();
    startEdit(act().transactions.length - 1, "date");
});

document.getElementById("add-fund").addEventListener("click", () => {
    act().funds.push({ fundName: "", amount: 0, goal: 0, description: "" });
    renderFunds();
    schedulePush();
});

document.getElementById("add-tab").addEventListener("click", () => {
    accounts.push({ ...DEFAULT_ACCOUNT(), accountName: "Account " + (accounts.length + 1) });
    current = accounts.length - 1;
    renderAll();
    renderTabs();
    schedulePush();
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("apikey");
    window.location.href = "/login";
});

// ---------- boot ----------

(async function boot() {
    const apikey = localStorage.getItem("apikey");
    if (!apikey) {
        window.location.href = "/login";
        return;
    }
    try {
        const data = await pullServer();
        if (data.accounts && data.accounts.length > 0) {
            accounts = data.accounts;
            current = 0;
        }
    } catch {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            try {
                const data = JSON.parse(raw);
                if (data.accounts && data.accounts.length > 0) {
                    accounts = data.accounts;
                    current = 0;
                }
            } catch { /* corrupted local data — start fresh */ }
        }
    }
    renderAll();
    renderTabs();
    loaded = true;
})();
import { getData, setData } from "./api";

const STORAGE_KEY = "john";

export class Data {
    version = 1
    apikey = ""
    accounts: any[] = []

    constructor(apikey: string) {
        this.apikey = apikey
    }

    saveLocal() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            version: this.version,
            apikey: this.apikey,
            accounts: this.accounts,
        }))
    }

    loadLocal() {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return false
        try {
            const data = JSON.parse(raw)
            this.version = data.version
            this.apikey = data.apikey
            this.accounts = data.accounts
            return true
        } catch {
            return false
        }
    }

    async pullServer() {
        const raw = await getData(this.apikey)
        const data = JSON.parse(raw)
        this.version = data.version
        this.apikey = data.apikey
        this.accounts = data.accounts
    }

    async pushServer() {
        await setData(this.apikey, {
            version: this.version,
            apikey: this.apikey,
            accounts: this.accounts,
        })
    }
}
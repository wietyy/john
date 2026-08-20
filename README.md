# JOHN

If you are reading this, welcome to hell. Not really. We're going to have a lot of fun.

JOHN is, put simply, an incredibly badass way to keep track of your finances. It started as a spreadsheet I made in 2024 and has since evolved into a full-stack web app because I have nothing better to do with my time.

## Stack (nerd stuff)

- **Backend**: Express 5, SQLite, bcrypt
- **Frontend**: Plain HTML/CSS/JS, served directly by Express. Just like 3rd grade.
- **Auth**: API key-based with username/password (don't worry, it's secure™)

## Structure

```
./           Project base
./src        The entire app
./src/public The frontend. HTML/CSS/JS, served straight by Express
./src/*.ts   The backend source
./agents     Spreadsheet exports and specs
```

## Quick Start

```bash
just setup   # creates .env, initializes the database, installs deps
just dev     # builds + starts the server
```

Then hit `http://localhost:3000`.

## What It Does

- **Accounts** with a key number so you can squirrel money away to funds without cluttering your transactions
- **Transactions** that work like a spreadsheet — click, type, done. No save button needed
- **Funds** with O/U tracking (that's Over/Under for you normies) and hidden notes
- **Cloud save** so you don't lose your data when your laptop explodes
- **Dark theme** because light mode is a war crime

## Routes

| Path | Page |
|---|---|
| `/` | Fancy landing page |
| `/login` | Sign in / Sign up |
| `/app` | The good stuff |

## Deployment Guide

may god himself have mercy on your soul

**HTTPS or GTFO.** JOHN sends passwords over the wire, so MITM attacks are a real threat. The server
serves HTTPS automatically when `SSL_KEY` and `SSL_CERT` env vars point at existing cert files (they're
set in `src/.env`).

```bash
just certs   # generate self-signed certs for local dev
just dev     # now serving over https://localhost:3000
```

Self-signed certs are fine for dev but your browser will scream at you. For prod, point `SSL_KEY`/`SSL_CERT`
at real certs from Let's Encrypt (certbot) or your host's panel. No certs configured? Falls back to plain
HTTP with a warning — don't deploy like that, ya goof.
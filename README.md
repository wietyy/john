# JOHN

If you are reading this, welcome to hell. Not really. We're going to have a lot of fun.

JOHN is, put simply, an incredibly badass way to keep track of your finances. It started as a spreadsheet I made in 2024 and has since evolved into a full-stack web app because I have nothing better to do with my time.

## Stack (nerd stuff)

- **Frontend**: React 19, Vite 8, Tailwind v4, react-router 8
- **Backend**: Express 5, SQLite, bcrypt
- **Auth**: API key-based with username/password (don't worry, it's secure™)

## Structure

```
./backend          The backend (it's in the name)
./frontend         Frontend base
./frontend/src     Main container for react app
./frontend/src/*   Individual pages, routed via react-router
./agents           Spreadsheet exports and specs
```

## Quick Start

```bash
just setup        # creates .env if it doesn't exist (lazy)
just dev          # builds backend + starts both servers
```

Or do it the hard way:

```bash
cd backend && npm run build && node dist/index.js &
cd frontend && npm run dev &
```

Frontend proxys `/api` to `localhost:3000` so everything just works.

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

NOTE TO SELF: YOU MUST USE HTTPS OR PEOPLE WILL HACK PEOPLES PASSWORDS

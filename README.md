# Quote Configurator Prototype — Project Wilson

An interactive UI prototype for the Quote Configurator flow targeting NBA Commercial Offering customers. Built with Lightning Web Components (LWC), Vite, and Salesforce Lightning Design System (SLDS v2).

## Prerequisites

- Node.js 20 or later
- npm

## Getting started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000` (or the next available port) with hot reload.

## Navigation

The prototype uses a multi-app shell with an App Launcher (waffle icon, top-left). Switch between apps using the launcher.

### Apps

| App | URL prefix | Description |
|-----|-----------|-------------|
| Sales | `/app` | Standard tab navigation — the primary app for the quote flow |
| Console App | `/console` | Console-style object switcher layout |
| Builder | `/builder` | Builder layout (structural only) |

### Pages (Sales app)

Navigate using the top tab bar or by switching pages from the App Launcher.

| Page | URL | Description |
|------|-----|-------------|
| Opportunities | `/app/opportunities` | Default landing page |
| Accounts | `/app/accounts` | Accounts list |
| Leads | `/app/leads` | Leads list |
| Product Bundles | `/app/product-bundles` | Product bundle catalog |
| Quote | `/app/quote` | **Quote Configurator entry point** |
| Reports | `/app/reports` | Reports placeholder |
| Dashboards | `/app/dashboards` | Dashboards placeholder |

## Quote Configurator flow

The quote flow is the core of this prototype. Access it via the **Quote** tab in the Sales app.

### Step 1 — Quote Configurator (`/app/quote`)

The parent configurator page. Hosts the `quoteIssuesWidget` which surfaces validation states and configuration actions.

Widget states:
- **Empty** — no products added yet
- **Warning** — products added but configuration incomplete
- **Issues** — one or more blocking issues (e.g. missing tenant assignment)
- **Valid** — all products configured and ready

### Step 2 — Product Selection (`/app/quote/product-selection`)

Reached from the Quote Configurator page. Lists available products for the quote.

For each product, a **pencil icon** opens the Tenant Configuration modal to assign an org.

### Step 3 — Tenant Configuration (`/app/quote/tenant-configuration`)

A dedicated tenant configuration page (also accessible as a modal from product rows and issue detail links).

#### Tenant Configuration Modal

Opened from three entry points:
1. Pencil icon on a product row in Product Selection
2. "Configure Tenant" button in the Issues Widget header
3. "Configure Tenant" link in an individual issue detail row

The modal lets the user:
- Select an existing org (Production or Sandbox)
- Choose **"Provision net-new"** *(stubbed — not completable in this prototype)*

Org data (static, for prototyping purposes):

| Org | ID | Type |
|-----|----|------|
| Production | 00D50000000xxxx | Production |
| Sandbox | 00D50000000yyyy | Sandbox |

Re-opening the modal for an already-configured product pre-loads the previously saved assignment.

## Project structure

```
src/
├── modules/
│   ├── page/               # Route views (one per route)
│   │   ├── quoteConfigurator/     # Quote parent page
│   │   ├── quoteProductSelection/ # Product selection step
│   │   ├── quoteTenantConfiguration/ # Tenant config page
│   │   └── ...                    # Other app pages
│   ├── ui/                 # Reusable components
│   │   ├── quoteIssuesWidget/     # Issues/valid state widget
│   │   ├── tenantConfigModal/     # Tenant assignment modal
│   │   └── ...
│   ├── data/               # Data modules (product store, flow config, quote session)
│   └── shell/              # App shell, layout, theme
├── routes.config.js        # All route definitions
├── apps.config.js          # App definitions and nav structure
└── index.js                # Entry point
```

## Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build (path routing) |
| `npm run build:gh-pages` | Build for GitHub Pages (hash routing) |
| `npm run deploy` | Build and deploy to `gh-pages` branch |
| `npm test` | Run routing tests |
| `npm run clean` | Remove `dist/`, `.vite/`, `node_modules/` |

## Deploying to GitHub Pages

```bash
npm run deploy
```

This builds the project with hash routing and pushes `dist/` to the `gh-pages` branch on `origin`. GitHub Pages must be set to **Deploy from a branch → gh-pages**.

## Stack

- [Lightning Web Components (LWC)](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)
- [Salesforce Lightning Design System (SLDS)](https://lightningdesignsystem.com)
- [Vite](https://vitejs.dev)
- Lightning Base Components

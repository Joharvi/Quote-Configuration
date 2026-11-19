const KEY_PRODUCTS    = 'proto-selected-products';
const KEY_ASSIGNMENTS = 'proto-tenant-assignments';

export function loadProducts() {
    try {
        const raw = localStorage.getItem(KEY_PRODUCTS);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

export function saveProducts(products) {
    try { localStorage.setItem(KEY_PRODUCTS, JSON.stringify(products)); } catch {}
}

export function loadAssignments() {
    try {
        const raw = localStorage.getItem(KEY_ASSIGNMENTS);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

export function saveAssignments(assignments) {
    try { localStorage.setItem(KEY_ASSIGNMENTS, JSON.stringify(assignments)); } catch {}
}

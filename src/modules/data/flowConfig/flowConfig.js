const STORAGE_KEY = 'proto-active-flow';

export function getActiveFlowId() {
    try {
        return localStorage.getItem(STORAGE_KEY) || 'version-a';
    } catch {
        return 'version-a';
    }
}

export function setActiveFlowId(id) {
    try {
        localStorage.setItem(STORAGE_KEY, id);
    } catch { /* storage unavailable */ }
}

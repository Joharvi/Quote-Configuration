let _active = false;
const _listeners = new Set();

function _notify() {
    _listeners.forEach((fn) => fn(_active));
}

export function openQuoteSession() {
    if (_active) return;
    _active = true;
    _notify();
}

export function closeQuoteSession() {
    if (!_active) return;
    _active = false;
    _notify();
}

export function isQuoteSessionActive() {
    return _active;
}

export function subscribeQuoteSession(callback) {
    _listeners.add(callback);
    return () => _listeners.delete(callback);
}

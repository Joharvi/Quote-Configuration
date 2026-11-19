import { LightningElement, api, track } from 'lwc';

export default class QuoteIssuesWidget extends LightningElement {
    /** Number of products currently in the quote cart. */
    @api productCount = 0;

    /**
     * Array of issue objects: { id, severity: 'error'|'warning', message, action? }
     * action shape: { label: string, event: string }
     */
    @api issues = [];

    /** Show the "Configure Tenant" brand button in the header. */
    @api showConfigureTenant = false;

    /** Show the "Suggested Products" base button in the header. */
    @api showSuggestedProducts = false;

    @track _expanded = true;

    /* ---- State derivation ---- */

    get errorCount() {
        return (this.issues || []).filter(i => i.severity === 'error').length;
    }

    get warningCount() {
        return (this.issues || []).filter(i => i.severity === 'warning').length;
    }

    get hasErrors() { return this.errorCount > 0; }
    get hasWarnings() { return this.warningCount > 0; }

    get widgetState() {
        if (this.productCount === 0) return 'empty';
        if ((this.issues || []).length === 0) return 'valid';
        return this.hasErrors ? 'issues' : 'warning';
    }

    get isFlat() {
        return this.widgetState === 'empty' || this.widgetState === 'valid';
    }

    /* ---- Computed template values ---- */

    get containerClass() {
        return `qiw qiw_state_${this.widgetState}`;
    }

    get ariaLabel() {
        switch (this.widgetState) {
            case 'empty':   return 'Quote Issues: no products selected';
            case 'valid':   return 'Quote Issues: valid';
            case 'warning': return `Quote Issues: ${this.warningLabel}`;
            default:        return `Quote Issues: ${this.errorLabel}, ${this.warningLabel}`;
        }
    }

    get flatIconName() {
        return this.widgetState === 'empty' ? 'utility:cart' : 'utility:success';
    }

    get flatLabel() {
        return this.widgetState === 'empty' ? 'No Products Selected' : 'Valid Quote';
    }

    get chevronIcon() {
        return this._expanded ? 'utility:chevrondown' : 'utility:chevronright';
    }

    get chevronAlt() {
        return this._expanded ? 'Collapse quote issues' : 'Expand quote issues';
    }

    get expandedString() {
        return String(this._expanded);
    }

    get errorLabel() {
        return this.errorCount === 1 ? '1 Error' : `${this.errorCount} Errors`;
    }

    get warningLabel() {
        return this.warningCount === 1 ? '1 Warning' : `${this.warningCount} Warnings`;
    }

    get normalizedIssues() {
        return (this.issues || []).map(issue => {
            const action = issue.action || null;
            const isError = issue.severity === 'error';
            return {
                id: issue.id,
                message: issue.message,
                severityIcon: isError ? 'utility:error' : 'utility:warning',
                severityAlt: isError ? 'Error' : 'Warning',
                severityClass: isError
                    ? 'qiw__severity-icon qiw__severity-icon_error'
                    : 'qiw__severity-icon qiw__severity-icon_warning',
                hasAction: !!action,
                actionLabel: action ? action.label : '',
                actionEvent: action ? (action.event || 'configuretenant') : '',
            };
        });
    }

    /* ---- Handlers ---- */

    handleToggle() {
        this._expanded = !this._expanded;
    }

    handleConfigureTenant() {
        this.dispatchEvent(new CustomEvent('configuretenant', { bubbles: true, composed: true }));
    }

    handleSuggestedProducts() {
        this.dispatchEvent(new CustomEvent('suggestedproducts', { bubbles: true, composed: true }));
    }

    handleIssueAction(event) {
        const id = event.currentTarget.dataset.id;
        const issue = (this.issues || []).find(i => i.id === id);
        if (!issue?.action) return;
        this.dispatchEvent(new CustomEvent(issue.action.event || 'configuretenant', {
            detail: { issueId: id },
            bubbles: true,
            composed: true,
        }));
    }
}

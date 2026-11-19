import LightningModal from 'lightning/modal';
import { api, track } from 'lwc';

const ORGS = [
    {
        id: 'prod',
        orgId: '00D50000000xxxx',
        environment: 'Production',
        region: 'Hyperforce US-East',
        status: 'Active',
    },
    {
        id: 'sandbox',
        orgId: '00D50000000yyyy',
        environment: 'Sandbox',
        region: 'Hyperforce US-East',
        status: 'Active',
    },
];

export default class TenantConfigModal extends LightningModal {
    /** Product name shown in the notification context line. */
    @api productName = 'Sales Cloud - Core Edition (NBA Commercial Offering)';

    /**
     * Pre-load a previously confirmed assignment.
     * Shape: { mode: 'existing', orgId: 'prod' }
     */
    @api initialAssignment = null;

    @track selectedMode = null;
    @track selectedOrgId = null;
    @track orgSearchTerm = '';
    @track envFilterValue = 'force.com';
    @track showValidationError = false;

    connectedCallback() {
        if (this.initialAssignment) {
            this.selectedMode = this.initialAssignment.mode || null;
            this.selectedOrgId = this.initialAssignment.orgId || null;
        }
    }

    /* ---- Static option lists ---- */

    get assignmentOptions() {
        return [
            { label: 'Assign to existing org', value: 'existing' },
            { label: 'Provision net-new', value: 'new' },
        ];
    }

    get envFilterOptions() {
        return [{ label: 'force.com', value: 'force.com' }];
    }

    /* ---- Derived state ---- */

    get showGuidance() {
        return !this.selectedMode;
    }

    get showExistingOrg() {
        return this.selectedMode === 'existing';
    }

    get showNetNew() {
        return this.selectedMode === 'new';
    }

    get filteredOrgs() {
        const term = this.orgSearchTerm ? this.orgSearchTerm.toLowerCase() : '';
        return ORGS
            .filter(o =>
                !term ||
                o.orgId.toLowerCase().includes(term) ||
                o.environment.toLowerCase().includes(term)
            )
            .map(o => ({
                ...o,
                isSelected: o.id === this.selectedOrgId,
                rowClass: `slds-hint-parent tcm-org-row${o.id === this.selectedOrgId ? ' tcm-org-row_selected slds-is-selected' : ''}`,
                checkboxLabel: `Select ${o.environment} org ${o.orgId}`,
            }));
    }

    get isValidSelection() {
        if (!this.selectedMode) return false;
        if (this.selectedMode === 'existing') return !!this.selectedOrgId;
        // 'new' branch awaits separate spec — not complete
        return false;
    }

    /* ---- Event handlers ---- */

    handleModeChange(event) {
        this.selectedMode = event.detail.value;
        this.showValidationError = false;
        // Clear org selection when switching modes
        if (this.selectedMode !== 'existing') {
            this.selectedOrgId = null;
        }
    }

    handleOrgSearch(event) {
        this.orgSearchTerm = event.detail.value;
    }

    handleEnvFilterChange(event) {
        this.envFilterValue = event.detail.value;
    }

    handleOrgRowClick(event) {
        const orgId = event.currentTarget.dataset.id;
        this.selectedOrgId = this.selectedOrgId === orgId ? null : orgId;
        this.showValidationError = false;
    }

    handleOrgCheck(event) {
        const orgId = event.currentTarget.dataset.id;
        // Single-select: checking an item selects it exclusively
        this.selectedOrgId = event.detail.checked ? orgId : null;
        this.showValidationError = false;
        // Prevent row-click from double-toggling
        event.stopPropagation();
    }

    handleCancel() {
        this.close(null);
    }

    handleConfirm() {
        if (!this.isValidSelection) {
            this.showValidationError = true;
            return;
        }
        const org = ORGS.find(o => o.id === this.selectedOrgId);
        this.close({
            mode: this.selectedMode,
            orgId: this.selectedOrgId,
            orgDisplayId: org ? org.orgId : '',
            environment: org ? org.environment : '',
        });
    }
}

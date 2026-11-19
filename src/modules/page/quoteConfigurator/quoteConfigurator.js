import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { closeQuoteSession } from '../../data/quoteSession/quoteSession';
import TenantConfigModal from 'ui/tenantConfigModal';
import { getActiveFlowId } from '../../data/flowConfig/flowConfig';

const STEPS_A = [
    { key: 'quote-header',          label: 'Quote Header' },
    { key: 'product-selection',     label: 'Product Selection' },
    { key: 'pricing',               label: 'Pricing' },
    { key: 'billing-information',   label: 'Billing Information' },
    { key: 'special-terms',         label: 'Special Terms' },
    { key: 'quote-review',          label: 'Quote Review' },
];

const STEPS_B = [
    { key: 'quote-header',          label: 'Quote Header' },
    { key: 'product-selection',     label: 'Product Selection' },
    { key: 'tenant-configuration',  label: 'Tenant Configuration' },
    { key: 'pricing',               label: 'Pricing' },
    { key: 'billing-information',   label: 'Billing Information' },
    { key: 'special-terms',         label: 'Special Terms' },
    { key: 'quote-review',          label: 'Quote Review' },
];

const PS_CATALOG = [
    { id: '1', name: 'Sales & Service Cloud - Core Edition',   price: '$190.00' },
    { id: '2', name: 'Sales & Service Cloud - Premium Edition', price: '$105.00' },
    { id: '3', name: 'Sales & Service Cloud - Unlimited Edition', price: '$355.00' },
    { id: '4', name: 'Sales Cloud - Core Edition',             price: '$165.00' },
    { id: '5', name: 'Sales Cloud - Premium Edition',          price: '$80.00' },
    { id: '6', name: 'Sales Cloud - Unlimited Edition',        price: '$330.00' },
    { id: '7', name: 'Service Cloud - Core Edition',           price: '$80.00' },
    { id: '8', name: 'Service Cloud - Premium Edition',        price: '$330.00' },
];

export default class QuoteConfigurator extends LightningElement {
    @track _currentStepIndex = 0;

    headerMeta = 'Quote: Q-00000  |  Acme Corp NBA Core Edition  |  Approval Status: Quote Not Created';

    /* ---- Quote Header form options ---- */

    emptyOptions = [];

    resellerRoleOptions = [
        { label: 'Select an Option', value: '' },
        { label: 'Reseller', value: 'Reseller' },
        { label: 'Distributor', value: 'Distributor' },
    ];

    currencyOptions = [
        { label: 'USD', value: 'USD' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
    ];

    priceListOptions = [
        { label: 'CPQ - Direct - Commercial - Ohana - WW - USD', value: 'CPQ - Direct - Commercial - Ohana - WW - USD' },
    ];

    countryOptions = [
        { label: 'US - United States', value: 'US - United States' },
        { label: 'CA - Canada', value: 'CA - Canada' },
        { label: 'GB - United Kingdom', value: 'GB - United Kingdom' },
    ];

    /* ---- Product Selection state ---- */

    @track _psProducts = [];
    @track psTenantAssignments = {};

    psSearch = '';
    psCategory = 'all';

    psCategoryOptions     = [{ label: 'All Categories', value: 'all' }];
    psPageSizeOptions     = [{ label: '10', value: '10' }, { label: '20', value: '20' }, { label: '50', value: '50' }];
    psTenantFilterOptions = [{ label: 'All Tenants', value: '' }];
    psCartOptions         = [{ label: 'Default Cart', value: 'default' }];

    /* ---- Steps ---- */

    get _steps() {
        return getActiveFlowId() === 'version-b' ? STEPS_B : STEPS_A;
    }

    /* ---- Path ---- */

    get pathSteps() {
        const last = this._steps.length - 1;
        return this._steps.map((step, i) => {
            const isComplete = i < this._currentStepIndex;
            const isCurrent  = i === this._currentStepIndex;

            let itemClass = 'slds-path__item qc-path__item';
            if (isComplete)      itemClass += ' slds-is-complete';
            else if (isCurrent)  itemClass += ' slds-is-current slds-is-active';
            else                 itemClass += ' slds-is-incomplete';
            if (i === last)      itemClass += ' qc-path__item_final';

            const linkClass = i === last
                ? 'slds-path__link qc-path__link_final'
                : 'slds-path__link';

            return {
                key: step.key,
                label: step.label,
                itemClass,
                linkClass,
                isComplete,
                isCurrent,
                tabIndex: isCurrent ? 0 : -1,
                ariaSelected: String(isCurrent),
            };
        });
    }

    /* ---- Step content visibility ---- */

    get isStepQuoteHeader() {
        return this._currentStepIndex === 0;
    }

    get isStepProductSelection() {
        return this._currentStepIndex === 1;
    }

    get isStepTenantConfiguration() {
        return this._currentStepIndex === 2 && getActiveFlowId() === 'version-b';
    }

    get currentStepLabel() {
        return this._steps[this._currentStepIndex]?.label ?? '';
    }

    /* ---- Action bar ---- */

    get hasPrevStep() {
        return this._currentStepIndex > 0;
    }

    get prevStepLabel() {
        return this._steps[this._currentStepIndex - 1]?.label ?? '';
    }

    get nextButtonLabel() {
        const next = this._steps[this._currentStepIndex + 1];
        return next ? next.label : 'Save Quote';
    }

    /* ---- Product Selection: computed ---- */

    get psProducts() {
        return this._psProducts.map(p => {
            const assignment = this.psTenantAssignments[p.id];
            const isAssigned = !!assignment;
            const tenantDisplay = isAssigned
                ? `${assignment.environment} · ${assignment.orgDisplayId}`
                : 'Not configured';
            return { ...p, isAssigned, showWarning: !isAssigned, tenantDisplay };
        });
    }

    get psCatalogItems() {
        const term = this.psSearch ? this.psSearch.toLowerCase() : '';
        return PS_CATALOG
            .filter(item => !term || item.name.toLowerCase().includes(term))
            .map(item => ({ ...item, selectLabel: `Select ${item.name}` }));
    }

    get psHasProducts() {
        return this._psProducts.length > 0;
    }

    get psShowEmpty() {
        return !this.psHasProducts;
    }

    get psCountLabel() {
        return `Selected Products (${this._psProducts.length})`;
    }

    get psCatalogCount() {
        return `${this.psCatalogItems.length} Product(s)`;
    }

    get psUnassigned() {
        return this._psProducts.filter(p => !this.psTenantAssignments[p.id]);
    }

    get psHasUnassigned() {
        return this.psUnassigned.length > 0;
    }

    get psIssuesList() {
        return this.psUnassigned.map(p => ({
            id: p.id,
            severity: 'warning',
            message: `Configure Tenant | ${p.name}`,
            action: { label: 'Configure Tenant', event: 'configuretenant' },
        }));
    }

    /* ---- Handlers: step navigation ---- */

    handleCancel() {
        closeQuoteSession();
        navigate('/opportunities');
    }

    handleBack() {
        if (this._currentStepIndex > 0) {
            this._currentStepIndex -= 1;
        }
    }

    handleNext() {
        if (this._currentStepIndex < this._steps.length - 1) {
            this._currentStepIndex += 1;
        }
    }

    /* ---- Handlers: Product Selection ---- */

    psHandleSearch(event) {
        this.psSearch = event.detail.value;
    }

    psHandleCategory(event) {
        this.psCategory = event.detail.value;
    }

    psHandleSelect(event) {
        const id = event.currentTarget.dataset.id;
        const item = PS_CATALOG.find(p => p.id === id);
        if (!item || this._psProducts.some(p => p.id === id)) return;
        this._psProducts = [
            ...this._psProducts,
            { id: item.id, name: item.name, price: item.price, quantity: 1 },
        ];
    }

    psHandleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.psHandleSelect(event);
        }
    }

    psHandleQtyChange(event) {
        const id = event.currentTarget.dataset.id;
        const qty = parseInt(event.detail.value, 10);
        this._psProducts = this._psProducts.map(p =>
            p.id === id
                ? { ...p, quantity: Number.isFinite(qty) && qty >= 1 ? qty : 1 }
                : p
        );
    }

    psHandleDelete(event) {
        const id = event.currentTarget.dataset.id;
        this._psProducts = this._psProducts.filter(p => p.id !== id);
        const updated = { ...this.psTenantAssignments };
        delete updated[id];
        this.psTenantAssignments = updated;
    }

    /* ---- Tenant configuration ---- */

    async psHandleConfigureTenant() {
        const target = this.psUnassigned[0] || this._psProducts[0];
        if (!target) return;
        await this._openPsTenantModal(target.id, target.name);
    }

    async psHandleEditTenant(event) {
        const id = event.currentTarget.dataset.id;
        const product = this._psProducts.find(p => p.id === id);
        if (!product) return;
        await this._openPsTenantModal(id, product.name);
    }

    async _openPsTenantModal(productId, productName) {
        const existing = this.psTenantAssignments[productId] || null;
        const result = await TenantConfigModal.open({
            size: 'large',
            label: 'Tenant & Fulfillment Configuration',
            productName,
            initialAssignment: existing,
        });
        if (result) {
            this.psTenantAssignments = { ...this.psTenantAssignments, [productId]: result };
        }
    }

    get psTcShowSuggested() {
        return false;
    }

    /* ---- Stubs ---- */

    psHandleSuggestedProducts() {}
}

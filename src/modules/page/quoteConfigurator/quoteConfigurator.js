import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';

const STEPS = [
    { key: 'quote-header',        label: 'Quote Header' },
    { key: 'product-selection',   label: 'Product Selection' },
    { key: 'pricing',             label: 'Pricing' },
    { key: 'billing-information', label: 'Billing Information' },
    { key: 'special-terms',       label: 'Special Terms' },
    { key: 'quote-review',        label: 'Quote Review' },
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

    @track psProducts = [];

    psSearch = '';
    psCategory = 'all';

    psCategoryOptions     = [{ label: 'All Categories', value: 'all' }];
    psPageSizeOptions     = [{ label: '10', value: '10' }, { label: '20', value: '20' }, { label: '50', value: '50' }];
    psTenantFilterOptions = [{ label: 'All Tenants', value: '' }];
    psCartOptions         = [{ label: 'Default Cart', value: 'default' }];
    psTenantStatusOptions = [{ label: 'Not configured', value: 'Not configured' }];

    /* ---- Path ---- */

    get pathSteps() {
        const last = STEPS.length - 1;
        return STEPS.map((step, i) => {
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

    get currentStepLabel() {
        return STEPS[this._currentStepIndex]?.label ?? '';
    }

    /* ---- Action bar ---- */

    get hasPrevStep() {
        return this._currentStepIndex > 0;
    }

    get prevStepLabel() {
        return STEPS[this._currentStepIndex - 1]?.label ?? '';
    }

    get nextButtonLabel() {
        const next = STEPS[this._currentStepIndex + 1];
        return next ? next.label : 'Save Quote';
    }

    /* ---- Product Selection: computed ---- */

    get psCatalogItems() {
        const term = this.psSearch ? this.psSearch.toLowerCase() : '';
        return PS_CATALOG
            .filter(item => !term || item.name.toLowerCase().includes(term))
            .map(item => ({ ...item, selectLabel: `Select ${item.name}` }));
    }

    get psHasProducts() {
        return this.psProducts.length > 0;
    }

    get psShowEmpty() {
        return !this.psHasProducts;
    }

    get psCountLabel() {
        return `Selected Products (${this.psProducts.length})`;
    }

    get psCatalogCount() {
        return `${this.psCatalogItems.length} Product(s)`;
    }

    get psIssuesList() {
        if (!this.psHasProducts) return [];
        return this.psProducts.map(p => ({
            id: p.id,
            severity: 'warning',
            message: `Configure Tenant | ${p.name} (NBA Commercial Offering)`,
            action: { label: 'Configure Tenant', event: 'configuretenant' },
        }));
    }

    /* ---- Handlers: step navigation ---- */

    handleCancel() {
        navigate('/opportunities');
    }

    handleBack() {
        if (this._currentStepIndex > 0) {
            this._currentStepIndex -= 1;
        }
    }

    handleNext() {
        if (this._currentStepIndex < STEPS.length - 1) {
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
        if (!item || this.psProducts.some(p => p.id === id)) return;
        this.psProducts = [
            ...this.psProducts,
            { id: item.id, name: item.name, price: item.price, quantity: 1, tenant: 'Not configured' },
        ];
        this.psSearch = item.name;
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
        this.psProducts = this.psProducts.map(p =>
            p.id === id
                ? { ...p, quantity: Number.isFinite(qty) && qty >= 1 ? qty : 1 }
                : p
        );
    }

    psHandleDelete(event) {
        const id = event.currentTarget.dataset.id;
        this.psProducts = this.psProducts.filter(p => p.id !== id);
        if (!this.psProducts.length) {
            this.psSearch = '';
        }
    }

    /* ---- Integration stubs (destinations not established) ---- */

    psHandleConfigureTenant() {}

    psHandleSuggestedProducts() {}

    psHandleAddBundle() {}

    psHandleEditBundle() {}
}

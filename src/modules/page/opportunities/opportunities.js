import { LightningElement } from 'lwc';
import { navigate } from '../../../router';
import { openQuoteSession } from '../../data/quoteSession/quoteSession';

export default class Opportunities extends LightningElement {
    fields = [
        { label: 'Opportunity Owner', value: 'Steven Fuller', type: 'text' },
        { label: 'Account Name', value: 'Goodyear Tire & Rubber Company', type: 'text' },
        { label: 'Close Date', value: '10/30/2025', type: 'text' },
        { label: 'Amount', value: 'USD 100,000.00', type: 'text' },
        { label: 'Forecast Category', value: 'Omitted', type: 'text' },
        { label: 'Opportunity Record Type', value: 'New Business / Add-On', type: 'text' },
    ];

    breadcrumbs = [];

    activeSections = ['oppInfo', 'dealReview', 'sysInfo'];

    handleCreateQuote(event) {
        event.preventDefault();
        openQuoteSession();
        navigate('/quote');
    }
}

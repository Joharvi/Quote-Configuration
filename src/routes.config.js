/**
 * Single source of truth for app routes.
 * Consumed by router.js (matching, titles) and app (nav maps, nav items).
 *
 * Fields:
 *   path       - URL pattern (use :param for dynamic segments). Logical, no app prefix.
 *   component  - LWC component name (must be registered in app.js ROUTE_COMPONENTS)
 *   title      - Document title (string or (params) => string)
 *   navPage    - Id for nav active state and navigate({ page }) (omit to hide from nav)
 *   navLabel   - Label shown in nav bar and in the Console object switcher
 *   navPath    - Optional; for dynamic routes, path used in nav links (e.g. /users/42)
 *   navHighlight - Optional; nav page id to highlight when this route is active (for child routes that don't create a tab)
 */

export const routes = [
  {
    path: '/accounts',
    component: 'page-accounts',
    title: 'Accounts',
    navPage: 'accounts',
    navLabel: 'Accounts',
  },
  {
    path: '/opportunities',
    component: 'page-opportunities',
    title: 'Opportunities',
    navPage: 'opportunities',
    navLabel: 'Opportunities',
  },
  {
    path: '/leads',
    component: 'page-leads',
    title: 'Leads',
    navPage: 'leads',
    navLabel: 'Leads',
  },
  {
    path: '/reports',
    component: 'page-reports',
    title: 'Reports',
    navPage: 'reports',
    navLabel: 'Reports',
  },
  {
    path: '/dashboards',
    component: 'page-dashboards',
    title: 'Dashboards',
    navPage: 'dashboards',
    navLabel: 'Dashboards',
  },
  {
    path: '/product-bundles',
    component: 'page-product-bundles',
    title: 'Product Bundles',
    navPage: 'productBundles',
    navLabel: 'Product Bundles',
  },
  {
    path: '/',
    component: 'page-home',
    title: 'Home',
    navPage: 'home',
    navLabel: 'Home',
  },
  {
    path: '/icons',
    component: 'page-icon-test',
    title: 'Icons',
    navPage: 'icons',
    navLabel: 'Icons',
  },
  {
    path: '/contacts',
    component: 'page-contacts',
    title: 'Contacts',
    navPage: 'contacts',
    navLabel: 'Contacts',
  },
  {
    path: '/contacts/:id',
    component: 'page-contact-detail',
    title: (params) => `Contact ${params.id}`,
    navHighlight: 'contacts',
  },
  {
    path: '/quote',
    component: 'page-quote-configurator',
    title: 'Quote Configurator',
    navPage: 'quoteConfigurator',
    navLabel: 'Quote',
  },
  {
    path: '/quote/product-selection',
    component: 'page-quote-product-selection',
    title: 'Quote Configurator — Product Selection',
    navHighlight: 'quoteConfigurator',
  },
  {
    path: '/quote/tenant-configuration',
    component: 'page-quote-tenant-configuration',
    title: 'Quote Configurator — Tenant Configuration',
    navHighlight: 'quoteConfigurator',
  },
  {
    path: '/',
    component: 'page-builder',
    title: 'Builder',
    app: 'builder',
  },
];

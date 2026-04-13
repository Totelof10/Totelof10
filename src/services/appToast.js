import { toast } from 'react-toastify';

const BASE_TOAST_OPTIONS = {
  position: 'top-right',
  autoClose: 2200,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  draggable: true,
  pauseOnHover: true
};

const SECTION_BY_PATH = {
  '/': 'Auth',
  '/register': 'Auth',
  '/forgot-password': 'Auth',
  '/dashboard': 'Dashboard',
  '/orders': 'Commandes',
  '/order': 'Commandes',
  '/product': 'Produits',
  '/supplier': 'Fournisseurs',
  '/customer': 'Clients',
  '/tiers': 'Tiers',
  '/charges': 'Charges',
  '/facture': 'Factures'
};

let isConfigured = false;
let sectionResolver = () => '';

function resolveSectionFromPath(pathname) {
  if (!pathname) return '';
  const matched = Object.keys(SECTION_BY_PATH).find((path) => pathname === path || pathname.startsWith(`${path}/`));
  return matched ? SECTION_BY_PATH[matched] : 'Application';
}

function withSectionPrefix(message, section) {
  if (typeof message !== 'string' || !section) return message;
  if (message.startsWith(`${section} -`)) return message;
  return `${section} - ${message}`;
}

function patchMethod(methodName, className) {
  const original = toast[methodName].bind(toast);
  toast[methodName] = (message, options = {}) => {
    const section = options.section || sectionResolver();
    const prefixedMessage = withSectionPrefix(message, section);
    const { section: _unused, ...restOptions } = options;
    return original(prefixedMessage, {
      ...BASE_TOAST_OPTIONS,
      ...restOptions,
      className: `${className}${restOptions.className ? ` ${restOptions.className}` : ''}`,
      progressClassName: 'app-toast-progress'
    });
  };
}

export function configureAppToast(getPathname) {
  if (isConfigured) return;
  isConfigured = true;

  sectionResolver = () => resolveSectionFromPath(getPathname?.());

  patchMethod('success', 'app-toast app-toast-success');
  patchMethod('error', 'app-toast app-toast-error');
  patchMethod('warning', 'app-toast app-toast-warning');
  patchMethod('info', 'app-toast app-toast-info');
}

export const appToast = toast;

import axios from 'axios';
import { getToken } from './AUTH';

const isDemoMode = String(import.meta.env.VITE_DEMO_MODE).toLowerCase() === 'true';
export const API_URL = isDemoMode ? '' : (import.meta.env.VITE_API_URL || '');

const toISODate = (d) => new Date(d).toISOString();
const toDateKey = (d) => new Date(d).toISOString().slice(0, 10);

const seedData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const suppliers = [
        { id: 1, name: 'Auto Parts Mada', contactPerson: 'Rado', email: 'contact@autoparts.mg', phone: '+261340000001', address: 'Antananarivo' },
        { id: 2, name: 'Tech Import', contactPerson: 'Mia', email: 'hello@techimport.mg', phone: '+261340000002', address: 'Toamasina' }
    ];

    const customers = [
        { id: 1, name: 'Espace Market', email: 'achat@espacemarket.mg', contactPerson: 'Lova', phone: '+261340100001', address: 'Antananarivo' },
        { id: 2, name: 'City Shop', email: 'manager@cityshop.mg', contactPerson: 'Tiana', phone: '+261340100002', address: 'Fianarantsoa' }
    ];

    const products = [
        {
            id: 1,
            name: 'Huile moteur 5W40',
            description: 'Huile synthese premium 5W40',
            sku: 'SKU-HUILE-001',
            imageUrl: 'https://images.unsplash.com/photo-1562516155-e0c1ee44059b?auto=format&fit=crop&w=900&q=80',
            price: 45000,
            purchasePrice: 32000,
            minStockQuantity: 8,
            unite: 'litre',
            category: 'AutomoBile',
            productStatus: 'ACTIF',
            supplier: suppliers[0]
        },
        {
            id: 2,
            name: 'Filtre a air',
            description: 'Filtre a air universel',
            sku: 'SKU-FIL-002',
            imageUrl: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=900&q=80',
            price: 28000,
            purchasePrice: 18000,
            minStockQuantity: 10,
            unite: 'piece',
            category: 'AutomoBile',
            productStatus: 'ACTIF',
            supplier: suppliers[1]
        },
        {
            id: 3,
            name: 'Batterie 12V',
            description: 'Batterie haute resistance',
            sku: 'SKU-BAT-003',
            imageUrl: 'https://images.unsplash.com/photo-1558618047-fd927a7fdb8f?auto=format&fit=crop&w=900&q=80',
            price: 120000,
            purchasePrice: 90000,
            minStockQuantity: 5,
            unite: 'piece',
            category: 'AutomoBile',
            productStatus: 'ACTIF',
            supplier: suppliers[0]
        }
    ];

    const stocks = products.map((p, i) => ({
        id: p.id,
        product: p,
        currentQuantity: 20 + i * 5,
        reservedQuantity: 1,
        damagedQuantity: 0
    }));

    const stockMovements = [
        { id: 1, productId: 1, type: 'AJOUT', quantity: 20, reason: 'Initialisation demo', movementDate: toISODate(yesterday) },
        { id: 2, productId: 2, type: 'AJOUT', quantity: 25, reason: 'Initialisation demo', movementDate: toISODate(yesterday) },
        { id: 3, productId: 3, type: 'AJOUT', quantity: 30, reason: 'Initialisation demo', movementDate: toISODate(yesterday) }
    ];

    const orderItems = [
        { id: 1, productId: 1, productName: products[0].name, quantity: 2, unitPrice: products[0].price, subtotal: products[0].price * 2, returnedQuantity: 0 },
        { id: 2, productId: 2, productName: products[1].name, quantity: 1, unitPrice: products[1].price, subtotal: products[1].price, returnedQuantity: 0 }
    ];

    const firstTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    const orders = [
        {
            id: 1,
            orderNumber: 'ORD-0001',
            customer: customers[0],
            customerName: customers[0].name,
            orderDate: toISODate(yesterday),
            dueDate: toISODate(now),
            status: 'PARTIALLY_PAID',
            discountAmount: 5000,
            totalAmount: firstTotal - 5000,
            orderItems,
            transactions: [
                { id: 1, type: 'PAYMENT', amount: 30000, paymentStatus: 'COMPLETED', createdAt: toISODate(yesterday) }
            ]
        }
    ];

    const charges = [
        { id: 1, chargeDate: toISODate(yesterday), raison: 'Carburant', montant: 35000 },
        { id: 2, chargeDate: toISODate(now), raison: 'Electricite', montant: 50000 }
    ];

    const factures = [
        {
            id: 1,
            invoiceNumber: 'FAC-0001',
            supplierId: suppliers[0].id,
            supplierName: suppliers[0].name,
            dateFacture: toISODate(yesterday),
            dateEcheance: toISODate(new Date(currentYear, now.getMonth(), now.getDate() + 10)),
            status: 'PENDING',
            montantTotal: 180000,
            items: [
                { id: 1, productId: 1, productName: products[0].name, quantity: 3, purchasePricePerUnit: 32000, subtotal: 96000 },
                { id: 2, productId: 3, productName: products[2].name, quantity: 1, purchasePricePerUnit: 84000, subtotal: 84000 }
            ]
        }
    ];

    return {
        counters: {
            customer: 3,
            supplier: 3,
            product: 4,
            order: 2,
            orderItem: 3,
            transaction: 2,
            charge: 3,
            facture: 2,
            factureItem: 3,
            stockMovement: 4
        },
        users: [{ id: 1, username: 'demo', password: 'demo123', email: 'demo@tsena.app' }],
        customers,
        suppliers,
        products,
        stocks,
        stockMovements,
        orders,
        charges,
        factures
    };
};

const STORAGE_KEY = 'tsena-demo-db-v1';

const loadDb = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        const seeded = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }
    try {
        return JSON.parse(raw);
    } catch {
        const seeded = seedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        return seeded;
    }
};

const saveDb = (db) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

const ok = (data, status = 200) => Promise.resolve({ data, status });

const fail = (status, message) => {
    const err = new Error(message);
    err.response = { status, data: { message } };
    return Promise.reject(err);
};

const parseUrl = (url) => new URL(url, 'http://demo.local');

const idFromPath = (pathname) => {
    const parts = pathname.split('/').filter(Boolean);
    const value = Number(parts[parts.length - 1]);
    return Number.isNaN(value) ? null : value;
};

const findOrder = (db, id) => db.orders.find((o) => Number(o.id) === Number(id));

const calculateNetPaid = (order) =>
    (order.transactions || []).reduce((sum, tx) => {
        if (tx.type === 'PAYMENT' && tx.paymentStatus === 'COMPLETED') return sum + Number(tx.amount || 0);
        if (tx.type === 'REFUND') return sum - Math.abs(Number(tx.amount || 0));
        return sum;
    }, 0);

const buildDashboardMonthly = (db, year) => {
    const map = {};
    for (let m = 1; m <= 12; m += 1) {
        const k = `${year}-${String(m).padStart(2, '0')}`;
        map[k] = { revenue: 0, productsSold: 0, benefice: 0 };
    }

    db.orders.forEach((order) => {
        const d = new Date(order.orderDate);
        const y = d.getFullYear();
        if (y !== Number(year)) return;
        const key = `${y}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const revenue = Number(order.totalAmount || 0);
        const cost = (order.orderItems || []).reduce((sum, item) => {
            const p = db.products.find((prod) => Number(prod.id) === Number(item.productId));
            const buy = Number(p?.purchasePrice || item.unitPrice || 0);
            return sum + buy * Number(item.quantity || 0);
        }, 0);
        map[key].revenue += revenue;
        map[key].productsSold += (order.orderItems || []).reduce((s, i) => s + Number(i.quantity || 0), 0);
        map[key].benefice += revenue - cost;
    });

    return map;
};

const buildCaBeneficeByDay = (db, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const result = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toDateKey(d);
        const dayOrders = db.orders.filter((o) => toDateKey(o.orderDate) === key);
        const dayCharges = db.charges
            .filter((c) => toDateKey(c.chargeDate) === key)
            .reduce((sum, c) => sum + Number(c.montant || 0), 0);

        const ca = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
        const cost = dayOrders.reduce((sum, order) => {
            const orderCost = (order.orderItems || []).reduce((s, item) => {
                const p = db.products.find((prod) => Number(prod.id) === Number(item.productId));
                return s + Number(p?.purchasePrice || 0) * Number(item.quantity || 0);
            }, 0);
            return sum + orderCost;
        }, 0);

        result.push({
            date: key,
            chiffreAffaire: ca,
            charge: dayCharges,
            benefice: ca - cost - dayCharges
        });
    }

    return result;
};

const applyStockMutation = (db, productId, deltaCurrent = 0, deltaDamaged = 0, reason = 'Operation demo', type = 'AJUSTEMENT') => {
    const stock = db.stocks.find((s) => Number(s.id) === Number(productId));
    if (!stock) return;
    stock.currentQuantity = Math.max(0, Number(stock.currentQuantity) + Number(deltaCurrent));
    stock.damagedQuantity = Math.max(0, Number(stock.damagedQuantity) + Number(deltaDamaged));

    const movement = {
        id: db.counters.stockMovement++,
        productId: Number(productId),
        type,
        quantity: Math.abs(Number(deltaCurrent || deltaDamaged || 0)),
        reason,
        movementDate: toISODate(new Date())
    };
    db.stockMovements.unshift(movement);
};

const demoAPI = {
    interceptors: {
        request: {
            use: () => {}
        }
    },

    async get(url) {
        const db = loadDb();
        const { pathname, searchParams } = parseUrl(url);

        if (pathname === '/customers') return ok(db.customers);
        if (pathname.startsWith('/customers/')) {
            const id = idFromPath(pathname);
            const customer = db.customers.find((c) => Number(c.id) === Number(id));
            return customer ? ok(customer) : fail(404, 'Client introuvable');
        }

        if (pathname === '/suppliers') return ok(db.suppliers);
        if (pathname.startsWith('/suppliers/')) {
            const id = idFromPath(pathname);
            const supplier = db.suppliers.find((s) => Number(s.id) === Number(id));
            return supplier ? ok(supplier) : fail(404, 'Fournisseur introuvable');
        }

        if (pathname === '/products') return ok({ content: db.products });
        if (pathname.startsWith('/products/by-supplier/')) {
            const parts = pathname.split('/');
            const supplierId = Number(parts[3]);
            return ok(db.products.filter((p) => Number(p.supplier?.id) === supplierId));
        }
        if (pathname.startsWith('/products/')) {
            const id = idFromPath(pathname);
            const product = db.products.find((p) => Number(p.id) === Number(id));
            return product ? ok(product) : fail(404, 'Produit introuvable');
        }

        if (pathname === '/orders') return ok({ content: db.orders });
        if (pathname === '/orders/by-date') {
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');
            const start = new Date(startDate);
            const end = new Date(endDate);
            const filtered = db.orders.filter((o) => {
                const d = new Date(o.orderDate);
                return d >= start && d <= end;
            });
            return ok({ content: filtered });
        }
        if (pathname === '/orders/overdue') {
            const now = new Date();
            const overdue = db.orders.filter((o) => new Date(o.dueDate) < now && o.status !== 'PAID');
            return ok(overdue);
        }
        if (pathname.startsWith('/orders/') && pathname.endsWith('/transactions')) {
            const id = Number(pathname.split('/')[2]);
            const order = findOrder(db, id);
            return order ? ok(order.transactions || []) : fail(404, 'Commande introuvable');
        }
        if (pathname.startsWith('/orders/') && pathname.endsWith('/net-paid-amount')) {
            const id = Number(pathname.split('/')[2]);
            const order = findOrder(db, id);
            return order ? ok(calculateNetPaid(order)) : fail(404, 'Commande introuvable');
        }
        if (pathname.startsWith('/orders/')) {
            const id = idFromPath(pathname);
            const order = findOrder(db, id);
            return order ? ok(order) : fail(404, 'Commande introuvable');
        }

        if (pathname.startsWith('/transaction/refund-total/')) {
            const id = idFromPath(pathname);
            const order = findOrder(db, id);
            if (!order) return fail(404, 'Commande introuvable');
            const total = (order.transactions || [])
                .filter((tx) => tx.type === 'REFUND')
                .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);
            return ok(total);
        }

        if (pathname === '/stock') return ok(db.stocks);
        if (pathname.startsWith('/stock/product/')) {
            const productId = Number(pathname.split('/')[3]);
            const stock = db.stocks.find((s) => Number(s.id) === productId);
            return stock ? ok(stock) : fail(404, 'Stock introuvable');
        }
        if (pathname.startsWith('/stock/')) {
            const id = idFromPath(pathname);
            const stock = db.stocks.find((s) => Number(s.id) === Number(id));
            return stock ? ok(stock) : fail(404, 'Stock introuvable');
        }

        if (pathname.startsWith('/stock-movements/product/')) {
            const productId = Number(pathname.split('/')[3]);
            const mouvements = db.stockMovements.filter((m) => Number(m.productId) === productId);
            return ok(mouvements);
        }

        if (pathname === '/charges') return ok(db.charges);
        if (pathname === '/charges/monthly-summary') {
            const year = Number(searchParams.get('year'));
            const summary = {};
            for (let m = 1; m <= 12; m += 1) {
                const k = `${year}-${String(m).padStart(2, '0')}`;
                summary[k] = { charges: 0 };
            }
            db.charges.forEach((c) => {
                const d = new Date(c.chargeDate);
                if (d.getFullYear() !== year) return;
                const k = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                summary[k].charges += Number(c.montant || 0);
            });
            return ok(summary);
        }
        if (pathname === '/charges/total-by-year') {
            const year = Number(searchParams.get('year'));
            const total = db.charges
                .filter((c) => new Date(c.chargeDate).getFullYear() === year)
                .reduce((sum, c) => sum + Number(c.montant || 0), 0);
            return ok(total);
        }

        if (pathname === '/dashboard/total-revenue') {
            const total = db.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
            return ok(total);
        }
        if (pathname === '/dashboard/total-products-sold') {
            const sold = db.orders.reduce(
                (sum, o) => sum + (o.orderItems || []).reduce((s, item) => s + Number(item.quantity || 0), 0),
                0
            );
            return ok(sold);
        }
        if (pathname === '/dashboard/monthly-revenue') {
            const year = Number(searchParams.get('year') || new Date().getFullYear());
            return ok(buildDashboardMonthly(db, year));
        }
        if (pathname === '/dashboard/revenue-between') {
            const startDate = new Date(searchParams.get('startDate'));
            const endDate = new Date(searchParams.get('endDate'));
            const total = db.orders
                .filter((o) => {
                    const d = new Date(o.orderDate);
                    return d >= startDate && d <= endDate;
                })
                .reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
            return ok(total);
        }
        if (pathname === '/dashboard/ca-benefice-par-jour') {
            const startDate = searchParams.get('startDate');
            const endDate = searchParams.get('endDate');
            return ok(buildCaBeneficeByDay(db, startDate, endDate));
        }
        if (pathname === '/dashboard/total-benefice') {
            const totalRevenue = db.orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
            const totalCost = db.orders.reduce((sum, order) => {
                return (
                    sum +
                    (order.orderItems || []).reduce((s, item) => {
                        const p = db.products.find((prod) => Number(prod.id) === Number(item.productId));
                        return s + Number(p?.purchasePrice || 0) * Number(item.quantity || 0);
                    }, 0)
                );
            }, 0);
            const totalCharges = db.charges.reduce((sum, c) => sum + Number(c.montant || 0), 0);
            return ok(totalRevenue - totalCost - totalCharges);
        }

        if (pathname === '/factures/fournisseurs') return ok(db.factures);
        if (pathname.startsWith('/factures/fournisseurs/')) {
            const id = Number(pathname.split('/')[3]);
            const facture = db.factures.find((f) => Number(f.id) === id);
            return facture ? ok(facture) : fail(404, 'Facture introuvable');
        }

        return fail(404, `Endpoint non pris en charge en mode demo: ${pathname}`);
    },

    async post(url, payload) {
        const db = loadDb();
        const { pathname, searchParams } = parseUrl(url);

        if (pathname === '/auth/login') {
            const { username, password } = payload || {};
            if (!username || !password) return fail(400, 'Identifiants manquants');
            return ok({ accessToken: 'demo-token', username }, 200);
        }

        if (pathname === '/auth/register') {
            const nextId = db.users.length + 1;
            db.users.push({ id: nextId, ...payload });
            saveDb(db);
            return ok({ message: 'Inscription reussie en mode demo' }, 201);
        }

        if (pathname === '/customers') {
            const customer = { id: db.counters.customer++, ...payload };
            db.customers.push(customer);
            saveDb(db);
            return ok(customer, 201);
        }

        if (pathname === '/suppliers') {
            const supplier = { id: db.counters.supplier++, ...payload };
            db.suppliers.push(supplier);
            saveDb(db);
            return ok(supplier, 201);
        }

        if (pathname === '/upload/image') {
            return ok('https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80', 201);
        }

        if (pathname === '/products') {
            const supplierId = Number(payload?.supplier?.id);
            const supplier = db.suppliers.find((s) => Number(s.id) === supplierId) || null;
            const product = {
                id: db.counters.product++,
                ...payload,
                supplier,
                productStatus: payload?.productStatus || 'ACTIF'
            };
            db.products.push(product);
            db.stocks.push({ id: product.id, product, currentQuantity: 0, reservedQuantity: 0, damagedQuantity: 0 });
            saveDb(db);
            return ok(product, 201);
        }

        if (pathname === '/orders') {
            const customerId = Number(payload?.customer?.id);
            const customer = db.customers.find((c) => Number(c.id) === customerId);
            if (!customer) return fail(400, 'Client introuvable');

            const items = (payload.orderItems || []).map((i) => {
                const productId = Number(i?.product?.id);
                const product = db.products.find((p) => Number(p.id) === productId);
                const quantity = Number(i.quantity || 0);
                const unitPrice = Number(product?.price || 0);
                return {
                    id: db.counters.orderItem++,
                    productId,
                    productName: product?.name || 'Produit inconnu',
                    quantity,
                    unitPrice,
                    subtotal: quantity * unitPrice,
                    returnedQuantity: 0
                };
            });

            const totalBeforeDiscount = items.reduce((sum, item) => sum + item.subtotal, 0);
            const discountAmount = Number(payload.discountAmount || 0);
            const order = {
                id: db.counters.order++,
                orderNumber: `ORD-${String(db.counters.order + 998).padStart(4, '0')}`,
                customer,
                customerName: customer.name,
                orderDate: toISODate(new Date()),
                dueDate: payload.dueDate || toISODate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
                status: 'PENDING',
                discountAmount,
                totalAmount: Math.max(0, totalBeforeDiscount - discountAmount),
                orderItems: items,
                transactions: []
            };

            items.forEach((it) => applyStockMutation(db, it.productId, -it.quantity, 0, 'Vente commande', 'RETRAIT'));

            db.orders.unshift(order);
            saveDb(db);
            return ok(order, 201);
        }

        if (pathname.match(/^\/orders\/\d+\/pay-cash$/)) {
            const id = Number(pathname.split('/')[2]);
            const order = findOrder(db, id);
            if (!order) return fail(404, 'Commande introuvable');

            const amount = Number(payload?.amount || 0);
            const tx = {
                id: db.counters.transaction++,
                type: 'PAYMENT',
                amount,
                paymentStatus: 'COMPLETED',
                createdAt: toISODate(new Date())
            };
            order.transactions.unshift(tx);
            const net = calculateNetPaid(order);
            order.status = net >= Number(order.totalAmount) ? 'PAID' : 'PARTIALLY_PAID';
            saveDb(db);
            return ok(tx, 200);
        }

        if (pathname.match(/^\/orders\/\d+\/process-returns$/)) {
            const id = Number(pathname.split('/')[2]);
            const order = findOrder(db, id);
            if (!order) return fail(404, 'Commande introuvable');

            (payload || []).forEach((ret) => {
                const item = order.orderItems.find((oi) => Number(oi.id) === Number(ret.orderItemId));
                if (!item) return;
                const qty = Number(ret.quantity || 0);
                item.returnedQuantity = Number(item.returnedQuantity || 0) + qty;

                if (ret.status === 'CONFORME') {
                    applyStockMutation(db, item.productId, qty, 0, 'Retour conforme', 'CONFORME');
                } else {
                    applyStockMutation(db, item.productId, 0, qty, 'Retour endommage', 'ENDOMMAGE');
                }

                const tx = {
                    id: db.counters.transaction++,
                    type: 'REFUND',
                    amount: qty * Number(item.unitPrice || 0),
                    paymentStatus: 'COMPLETED',
                    createdAt: toISODate(new Date())
                };
                order.transactions.unshift(tx);
            });

            order.status = 'RETURNED';
            if (order.orderItems.every((oi) => Number(oi.returnedQuantity || 0) >= Number(oi.quantity || 0))) {
                order.status = 'COMPLETED_RETURN';
            }
            saveDb(db);
            return ok(order, 200);
        }

        if (pathname === '/charges') {
            const charge = { id: db.counters.charge++, ...payload };
            db.charges.unshift(charge);
            saveDb(db);
            return ok(charge, 201);
        }

        if (pathname === '/factures/fournisseurs') {
            const supplierId = Number(payload?.supplierId);
            const supplier = db.suppliers.find((s) => Number(s.id) === supplierId);
            if (!supplier) return fail(400, 'Fournisseur introuvable');

            const items = (payload?.items || []).map((it) => {
                const product = db.products.find((p) => Number(p.id) === Number(it.productId));
                const quantity = Number(it.quantity || 0);
                const unit = Number(it.purchasePricePerUnit || product?.purchasePrice || 0);
                applyStockMutation(db, Number(it.productId), quantity, 0, 'Reception fournisseur', 'AJOUT');
                return {
                    id: db.counters.factureItem++,
                    productId: Number(it.productId),
                    productName: product?.name || 'Produit inconnu',
                    quantity,
                    purchasePricePerUnit: unit,
                    subtotal: quantity * unit
                };
            });

            const facture = {
                id: db.counters.facture++,
                invoiceNumber: `FAC-${String(db.counters.facture + 998).padStart(4, '0')}`,
                supplierId,
                supplierName: supplier.name,
                dateFacture: toISODate(new Date()),
                dateEcheance: payload?.dateEcheance || toISODate(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)),
                status: 'PENDING',
                montantTotal: items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0),
                items
            };

            db.factures.unshift(facture);
            saveDb(db);
            return ok(facture, 201);
        }

        if (pathname.match(/^\/factures\/fournisseurs\/\d+\/pay$/)) {
            const id = Number(pathname.split('/')[3]);
            const facture = db.factures.find((f) => Number(f.id) === id);
            if (!facture) return fail(404, 'Facture introuvable');
            facture.status = 'PAID';
            saveDb(db);
            return ok(facture, 200);
        }

        if (pathname === '/stock') {
            const stock = { id: Number(payload?.productId), ...payload };
            db.stocks.push(stock);
            saveDb(db);
            return ok(stock, 201);
        }

        if (pathname.match(/^\/stock\/\d+\/move-to-damaged$/)) {
            const productId = Number(pathname.split('/')[2]);
            const quantity = Number(searchParams.get('quantity') || payload?.quantity || 0);
            const reason = searchParams.get('reason') || payload?.reason || 'Stock endommage';
            applyStockMutation(db, productId, -quantity, quantity, reason, 'ENDOMMAGE');
            saveDb(db);
            return ok({ message: 'Stock endommage mis a jour' }, 200);
        }

        if (pathname.match(/^\/stock\/\d+\/remove-damaged$/)) {
            const productId = Number(pathname.split('/')[2]);
            const quantity = Number(searchParams.get('quantity') || payload?.quantity || 0);
            const reason = searchParams.get('reason') || payload?.reason || 'Suppression endommage';
            applyStockMutation(db, productId, 0, -quantity, reason, 'SUPPRESSION_ENDOMMAGE');
            saveDb(db);
            return ok({ message: 'Stock endommage supprime' }, 200);
        }

        if (pathname.match(/^\/stock\/update-quantity\/\d+$/)) {
            const productId = Number(pathname.split('/')[3]);
            const quantityChange = Number(searchParams.get('quantityChange') || 0);
            applyStockMutation(db, productId, quantityChange, 0, 'Mise a jour quantite', 'AJUSTEMENT');
            saveDb(db);
            return ok({ message: 'Quantite mise a jour' }, 200);
        }

        return fail(404, `Endpoint non pris en charge en mode demo: ${pathname}`);
    },

    async put(url, payload) {
        const db = loadDb();
        const { pathname, searchParams } = parseUrl(url);

        if (pathname.startsWith('/customers/')) {
            const id = idFromPath(pathname);
            const idx = db.customers.findIndex((c) => Number(c.id) === Number(id));
            if (idx === -1) return fail(404, 'Client introuvable');
            db.customers[idx] = { ...db.customers[idx], ...payload, id: db.customers[idx].id };
            saveDb(db);
            return ok(db.customers[idx], 200);
        }

        if (pathname.startsWith('/suppliers/')) {
            const id = idFromPath(pathname);
            const idx = db.suppliers.findIndex((s) => Number(s.id) === Number(id));
            if (idx === -1) return fail(404, 'Fournisseur introuvable');
            db.suppliers[idx] = { ...db.suppliers[idx], ...payload, id: db.suppliers[idx].id };
            saveDb(db);
            return ok(db.suppliers[idx], 200);
        }

        if (pathname.startsWith('/products/')) {
            const id = idFromPath(pathname);
            const idx = db.products.findIndex((p) => Number(p.id) === Number(id));
            if (idx === -1) return fail(404, 'Produit introuvable');
            const supplierId = Number(payload?.supplier?.id || db.products[idx]?.supplier?.id);
            const supplier = db.suppliers.find((s) => Number(s.id) === supplierId) || null;
            db.products[idx] = { ...db.products[idx], ...payload, supplier, id: db.products[idx].id };
            const stock = db.stocks.find((s) => Number(s.id) === Number(id));
            if (stock) stock.product = db.products[idx];
            saveDb(db);
            return ok(db.products[idx], 200);
        }

        if (pathname.match(/^\/orders\/\d+\/status$/)) {
            const id = Number(pathname.split('/')[2]);
            const order = findOrder(db, id);
            if (!order) return fail(404, 'Commande introuvable');
            order.status = searchParams.get('newStatus') || payload?.newStatus || order.status;
            saveDb(db);
            return ok(order, 200);
        }

        if (pathname.match(/^\/stock\/\d+\/add$/)) {
            const productId = Number(pathname.split('/')[2]);
            const quantity = Number(searchParams.get('quantity') || payload?.quantity || 0);
            const reason = searchParams.get('reason') || payload?.reason || 'Ajout stock';
            applyStockMutation(db, productId, quantity, 0, reason, 'AJOUT');
            saveDb(db);
            return ok({ message: 'Stock ajoute' }, 200);
        }

        if (pathname.match(/^\/stock\/\d+\/remove$/)) {
            const productId = Number(pathname.split('/')[2]);
            const quantity = Number(searchParams.get('quantity') || payload?.quantity || 0);
            const reason = searchParams.get('reason') || payload?.reason || 'Retrait stock';
            applyStockMutation(db, productId, -quantity, 0, reason, 'RETRAIT');
            saveDb(db);
            return ok({ message: 'Stock retire' }, 200);
        }

        if (pathname.match(/^\/stock\/\d+\/retour-fournisseur$/)) {
            const productId = Number(pathname.split('/')[2]);
            const quantity = Number(searchParams.get('quantity') || payload?.quantity || 0);
            applyStockMutation(db, productId, -quantity, 0, 'Retour fournisseur', 'RETOUR_FOURNISSEUR');
            saveDb(db);
            return ok({ message: 'Retour fournisseur effectue' }, 200);
        }

        return fail(404, `Endpoint non pris en charge en mode demo: ${pathname}`);
    },

    async delete(url) {
        const db = loadDb();
        const { pathname } = parseUrl(url);

        if (pathname.startsWith('/customers/')) {
            const id = idFromPath(pathname);
            db.customers = db.customers.filter((c) => Number(c.id) !== Number(id));
            saveDb(db);
            return ok({}, 204);
        }

        if (pathname.startsWith('/suppliers/')) {
            const id = idFromPath(pathname);
            db.suppliers = db.suppliers.filter((s) => Number(s.id) !== Number(id));
            db.products = db.products.map((p) => (Number(p.supplier?.id) === Number(id) ? { ...p, supplier: null } : p));
            saveDb(db);
            return ok({}, 204);
        }

        if (pathname.startsWith('/products/')) {
            const id = idFromPath(pathname);
            db.products = db.products.filter((p) => Number(p.id) !== Number(id));
            db.stocks = db.stocks.filter((s) => Number(s.id) !== Number(id));
            db.stockMovements = db.stockMovements.filter((m) => Number(m.productId) !== Number(id));
            saveDb(db);
            return ok({}, 204);
        }

        if (pathname.startsWith('/orders/')) {
            const id = idFromPath(pathname);
            db.orders = db.orders.filter((o) => Number(o.id) !== Number(id));
            saveDb(db);
            return ok({}, 204);
        }

        if (pathname.startsWith('/charges/')) {
            const id = idFromPath(pathname);
            db.charges = db.charges.filter((c) => Number(c.id) !== Number(id));
            saveDb(db);
            return ok({}, 204);
        }

        if (pathname.startsWith('/factures/fournisseurs/')) {
            const id = Number(pathname.split('/')[3]);
            db.factures = db.factures.filter((f) => Number(f.id) !== Number(id));
            saveDb(db);
            return ok({}, 204);
        }

        if (pathname.startsWith('/stock/')) {
            const id = idFromPath(pathname);
            db.stocks = db.stocks.filter((s) => Number(s.id) !== Number(id));
            saveDb(db);
            return ok({}, 204);
        }

        return fail(404, `Endpoint non pris en charge en mode demo: ${pathname}`);
    }
};

const realAPI = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json'
    }
});

realAPI.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const API = isDemoMode ? demoAPI : realAPI;

export default API;
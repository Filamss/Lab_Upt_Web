import { defineStore } from 'pinia';

/**
 * The Order store maintains a collection of orders and provides
 * actions for common workflows: adding new orders, updating an
 * existing order, setting the status, attaching a payment, and
 * assigning staff.  Orders are represented with a handful of useful
 * fields such as the order number, sample number, customer ID,
 * commodity, status, dates, totals and payment breakdown.
 */
export const useOrderStore = defineStore('order', {
  state: () => ({
    /**
     * List of orders.  Field names use English for variables while
     * Indonesian labels can be used at the UI level.
     */
    orders: [
      {
        id: 1,
        orderNo: 'ORD-001',
        sampleNo: 'SMP-001',
        customerId: 1,
        commodity: 'Pupuk',
        status: 'new',
        date: '2025-09-20',
        total: 500000,
        downPayment: 200000,
        remaining: 300000,
      },
      {
        id: 2,
        orderNo: 'ORD-002',
        sampleNo: 'SMP-002',
        customerId: 2,
        commodity: 'Pangan',
        status: 'in_testing',
        date: '2025-09-21',
        total: 1000000,
        downPayment: 500000,
        remaining: 500000,
      },
      {
        id: 3,
        orderNo: 'ORD-003',
        sampleNo: 'SMP-003',
        customerId: 3,
        commodity: 'Tekstil',
        status: 'completed',
        date: '2025-09-18',
        total: 750000,
        downPayment: 750000,
        remaining: 0,
      },
    ],
  }),
  actions: {
    /**
     * Add a new order.  Automatically assigns an id if not provided.
     */
    addOrder(order) {
      const nextId = this.orders.length ? Math.max(...this.orders.map((o) => o.id)) + 1 : 1;
      this.orders.push({ id: nextId, ...order });
    },
    /**
     * Update an order by id with provided fields.
     */
    updateOrder(id, updates) {
      const idx = this.orders.findIndex((o) => o.id === id);
      if (idx !== -1) {
        this.orders[idx] = { ...this.orders[idx], ...updates };
      }
    },
    /**
     * Set the status of an order.
     */
    setStatus(id, status) {
      const order = this.orders.find((o) => o.id === id);
      if (order) order.status = status;
    },
    /**
     * Attach a payment amount to an order.  Updates downPayment & remaining.
     */
    attachPayment(id, amount) {
      const order = this.orders.find((o) => o.id === id);
      if (order) {
        order.downPayment += amount;
        order.remaining = Math.max(order.total - order.downPayment, 0);
      }
    },
    /**
     * Assign supervisor/technician fields or any other staff to an order.
     */
    assignStaff(id, staffAssignments) {
      const order = this.orders.find((o) => o.id === id);
      if (order) Object.assign(order, staffAssignments);
    },
  },
});
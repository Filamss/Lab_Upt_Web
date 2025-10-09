import { defineStore } from 'pinia';

/**
 * Store used to record user activities (audit log).  Each activity
 * includes the acting user's id, a description of the action, the
 * related order id, and a timestamp.  Activities are displayed on
 * the dashboard in the recent activity widget.
 */
export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [
      { id: 1, userId: 2, action: 'Created order ORD-001', orderId: 1, timestamp: new Date().toISOString() },
      { id: 2, userId: 3, action: 'Validated order ORD-001', orderId: 1, timestamp: new Date().toISOString() },
    ],
  }),
  actions: {
    /**
     * Add a new activity entry to the log.
     */
    logActivity(activity) {
      const nextId = this.activities.length ? Math.max(...this.activities.map((a) => a.id)) + 1 : 1;
      this.activities.unshift({ id: nextId, timestamp: new Date().toISOString(), ...activity });
    },
  },
});
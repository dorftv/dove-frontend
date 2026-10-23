// The colour of a slot in the slot layout: its frame on the scene's picture and its row in the
// slot list. By the slot's id, so a slot keeps its colour while others move.
const SLOT_COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

export function slotColor(slot) {
  return SLOT_COLORS[slot.id % SLOT_COLORS.length];
}

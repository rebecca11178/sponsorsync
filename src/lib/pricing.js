// Creator-set pricing overrides, persisted per browser.
// Lets a creator set their own rate card (on /creator/profile) and have those
// prices show to sponsors (on /creators/[id]) within the same browser session.
// TODO(api): replace localStorage with the creator's saved rate card in the DB.
const KEY = "sponsorsync.rates";

export function loadAllOverrides() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

// Merge a creator's stored overrides over their default rates/add-ons.
export function mergePricing(creator, overrides) {
  const o = overrides?.[creator.id] || {};
  return {
    rates: { ...creator.rates, ...(o.rates || {}) },
    commercialRights: { ...creator.commercialRights, ...(o.commercialRights || {}) },
  };
}

export function saveCreatorPricing(creatorId, pricing) {
  try {
    const all = loadAllOverrides();
    all[creatorId] = pricing;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore blocked storage */
  }
}

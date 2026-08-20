import { ClientSchema, validate, type Client } from './schema';

/**
 * Deck slide 4 (logo plate, 22 marks) and slide 33 (social-media clients,
 * 5 marks).
 *
 * ⚠️ 22 + 5 = 27, but SPYKAR APPEARS IN BOTH. There are 26 unique names.
 * Every vault document says "27 marks"; that count double-counts Spykar
 * across two categories. The counter derives from this array's length so
 * it reports the honest figure.
 *
 * Usage rights confirmed by the client 2026-08-17 (TBD B1). Standing
 * condition: if any client objects post-launch, drop the `mark` and the
 * name still renders as text.
 *
 * `mark` is absent on every entry because the logos exist only as raster
 * inside the credentials deck. Until they exist as vectors, the grid
 * renders names as type — which is a legitimate treatment, not a fallback.
 */
const raw = [
  { name: 'Google Pixel', source: ['logo-plate'] },
  { name: 'Colors (Viacom18)', source: ['logo-plate'] },
  { name: 'Lenovo', source: ['logo-plate'] },
  { name: 'MTV', source: ['logo-plate'] },
  { name: 'Hippo', source: ['logo-plate'] },
  { name: 'Motorola', source: ['logo-plate'] },
  { name: 'Spykar', source: ['logo-plate', 'social-media'] },
  { name: 'Aegon Religare Life Insurance', source: ['logo-plate'] },
  { name: 'Phoenix Marketcity', source: ['logo-plate'] },
  { name: 'L&T Insurance', source: ['logo-plate'] },
  { name: 'Toyota Land Cruiser Prado', source: ['logo-plate'] },
  { name: 'Toyota New Prius', source: ['logo-plate'] },
  { name: 'Emirates', source: ['logo-plate'] },
  { name: 'Indiabulls Real Estate', source: ['logo-plate'] },
  { name: 'Pidilite', source: ['logo-plate'] },
  { name: 'B2X', source: ['logo-plate'] },
  { name: 'M2P', source: ['logo-plate'] },
  { name: 'Synergycom', source: ['logo-plate'] },
  { name: 'Johnson & Johnson', source: ['logo-plate'] },
  { name: 'Abbott', source: ['logo-plate'] },
  { name: 'Sun Pharma', source: ['logo-plate'] },
  { name: 'Pronto Insurance', source: ['logo-plate'] },
  { name: 'Zee Studio HD', source: ['social-media'] },
  { name: 'Zee Café', source: ['social-media'] },
  { name: 'History TV18', source: ['social-media'] },
  { name: 'NSE (National Stock Exchange of India)', source: ['social-media'] },
];

export const clients: Client[] = raw.map((c, i) => validate(ClientSchema, c, `client[${i}]`));

/** 26 — unique named brands, Spykar counted once. */
export const totalClients = clients.length;

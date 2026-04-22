import type { MenuCategory, MenuItemRecord } from "./types";

function createMenuImage(
  title: string,
  subtitle: string,
  colors: [string, string],
  garnish: string,
) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="224" viewBox="0 0 320 224">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
        <radialGradient id="plate" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96" />
          <stop offset="100%" stop-color="#e2e8f0" stop-opacity="0.92" />
        </radialGradient>
      </defs>
      <rect width="320" height="224" rx="24" fill="url(#bg)" />
      <circle cx="274" cy="42" r="52" fill="rgba(255,255,255,0.12)" />
      <circle cx="58" cy="182" r="66" fill="rgba(15,23,42,0.08)" />
      <ellipse cx="160" cy="128" rx="102" ry="58" fill="url(#plate)" />
      <ellipse cx="160" cy="132" rx="78" ry="40" fill="${garnish}" fill-opacity="0.28" />
      <ellipse cx="125" cy="118" rx="28" ry="18" fill="${garnish}" fill-opacity="0.64" />
      <ellipse cx="182" cy="142" rx="34" ry="20" fill="#f8fafc" fill-opacity="0.78" />
      <ellipse cx="204" cy="112" rx="18" ry="12" fill="${garnish}" fill-opacity="0.42" />
      <rect x="18" y="18" width="156" height="54" rx="14" fill="rgba(15,23,42,0.28)" />
      <text x="32" y="42" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700">${title}</text>
      <text x="32" y="61" fill="rgba(255,255,255,0.82)" font-family="Arial, Helvetica, sans-serif" font-size="12">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createMenuItem(
  id: string,
  name: string,
  category: MenuCategory,
  description: string,
  prices: MenuItemRecord["prices"],
  sku: string,
  prepTime: number,
  colors: [string, string],
  garnish: string,
  available = true,
) {
  const [title, subtitle = category] = name.split(", ");

  return {
    id,
    name,
    category,
    description,
    prices,
    sku,
    prepTime,
    available,
    image: createMenuImage(title, subtitle, colors, garnish),
  } satisfies MenuItemRecord;
}

export const INITIAL_MENU_ITEMS: MenuItemRecord[] = [
  createMenuItem(
    "menu-001",
    "Boiled Seer, Mashed Potato and Vegetables",
    "Seafood",
    "Tender seer fish served with herb mashed potato, buttered beans, and roasted seasonal vegetables.",
    { small: 2450, medium: 3120, large: 3890 },
    "SEA-104",
    18,
    ["#0f172a", "#1d4ed8"],
    "#38bdf8",
  ),
  createMenuItem(
    "menu-002",
    "Grilled Chicken Bowl",
    "Chicken",
    "Char-grilled chicken breast, fragrant rice, grilled corn, avocado, and citrus dressing.",
    { small: 1820, medium: 2350, large: 2890 },
    "CHK-208",
    14,
    ["#78350f", "#f97316"],
    "#fbbf24",
  ),
  createMenuItem(
    "menu-003",
    "Seafood Noodles",
    "Noodles",
    "Wok-tossed noodles with prawns, cuttlefish, scallions, and a light soy pepper glaze.",
    { small: 1950, medium: 2480, large: 3060 },
    "NOD-310",
    16,
    ["#164e63", "#06b6d4"],
    "#34d399",
  ),
  createMenuItem(
    "menu-004",
    "Chicken Fried Rice",
    "Rice",
    "Jasmine rice stir-fried with marinated chicken, egg, leeks, and smoky sesame oil.",
    { small: 1640, medium: 2160, large: 2720 },
    "RIC-122",
    12,
    ["#854d0e", "#f59e0b"],
    "#facc15",
  ),
  createMenuItem(
    "menu-005",
    "Caesar Salad",
    "Salads",
    "Romaine lettuce, parmesan crisps, garlic croutons, and house Caesar dressing.",
    { small: 1280, medium: 1690, large: 2140 },
    "SAL-091",
    8,
    ["#14532d", "#22c55e"],
    "#bef264",
  ),
  createMenuItem(
    "menu-006",
    "Classic Burger Combo",
    "Burgers",
    "Beef patty with cheddar, lettuce, tomato, fries, and a toasted brioche bun.",
    { small: 1790, medium: 2290, large: 2810 },
    "BRG-440",
    15,
    ["#7c2d12", "#ef4444"],
    "#f59e0b",
  ),
  createMenuItem(
    "menu-007",
    "Tomato Soup",
    "Soups",
    "Slow-roasted tomato soup finished with basil oil and black pepper cream.",
    { small: 760, medium: 980, large: 1220 },
    "SUP-077",
    7,
    ["#7f1d1d", "#fb7185"],
    "#fca5a5",
  ),
  createMenuItem(
    "menu-008",
    "Chocolate Brownie",
    "Desserts",
    "Warm dark chocolate brownie with sea salt caramel and whipped cream.",
    { small: 920, medium: 1140, large: 1380 },
    "DST-515",
    6,
    ["#422006", "#92400e"],
    "#fde68a",
  ),
  createMenuItem(
    "menu-009",
    "Fresh Lime Juice",
    "Beverages",
    "Freshly squeezed lime, soda, and mint served chilled over crystal ice.",
    { small: 540, medium: 690, large: 840 },
    "BEV-041",
    4,
    ["#14532d", "#4ade80"],
    "#d9f99d",
  ),
  createMenuItem(
    "menu-010",
    "Spicy Beef Curry",
    "Beef",
    "Slow-cooked beef curry with roasted spices, coconut milk, and curry leaves.",
    { small: 2140, medium: 2730, large: 3380 },
    "BEE-370",
    19,
    ["#3f1d1d", "#b91c1c"],
    "#fb7185",
    false,
  ),
];

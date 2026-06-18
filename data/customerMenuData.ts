import type { CustomerMenuData, MenuItem, ServingSize } from "@/types/customer";

const servingSizes: ServingSize[] = ["Small", "Medium", "Large"];

function createServingPrices(basePrice: number) {
  return {
    Small: Math.max(basePrice - 320, 780),
    Medium: basePrice,
    Large: basePrice + 420,
  } satisfies Record<ServingSize, number>;
}

function createItem(item: Omit<MenuItem, "servingPrices" | "prepTime"> & { prepTime?: number }): MenuItem {
  return {
    prepTime: 12,
    ...item,
    servingPrices: createServingPrices(item.basePrice),
  };
}

export const customerMenuData: CustomerMenuData = {
  restaurant: {
    name: "Letona Cafe",
    businessType: "Cafe",
    kitchenCloseTime: "11:00 PM",
    status: "Kitchen open until 11:00 PM",
    titlePrefix: "Letona",
    titleAccent: "Cafe",
    tagline: "restaurant by the beach",
    location: "Negombo Lagoon Front",
    heroSummary:
      "A polished, manager-editable hero area ready for restaurant branding, promotions, or seasonal cover images.",
    heroNote: "Chef-curated menu with live-ready layout blocks",
    bannerLabel: "Today's Signature Menu",
    restaurantImageUrl: "/customer/placeholder-food.svg",
    kitchenHours: "Kitchen open until 11:00 PM",
  },
  contact: {
    phone: "+94 31 225 4488",
    email: "hello@letonacafe.demo",
    address: "18 Beach Road, Negombo, Sri Lanka",
    openingHours: "Daily 11:00 AM - 11:00 PM",
    reservations: "Reservations available for lagoon deck seating",
    socials: [
      {
        label: "Instagram",
        value: "@letonacafe",
        href: "https://example.com/letonacafe-instagram",
      },
      {
        label: "Facebook",
        value: "Letona Cafe",
        href: "https://example.com/letonacafe-facebook",
      },
      {
        label: "WhatsApp",
        value: "+94 71 555 0188",
        href: "https://example.com/letonacafe-whatsapp",
      },
    ],
  },
  categories: [
    {
      id: "sea-foods",
      name: "Sea Foods",
      accentLabel: "Fresh catch",
      description: "Coastal specials, lagoon classics, and crisp grills.",
      subcategories: [
        {
          id: "sea-salads",
          name: "Salads",
          description: "Bright starters with citrus dressings and herbs.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "sea-salad-1",
              name: "Boiled Seer, Mashed Potato and Vegetables",
              description:
                "Tender seer fish served with buttered vegetables, creamy mash, and a lime herb drizzle.",
              image: "/customer/sea-bowl.svg",
              basePrice: 2950,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "sea-salad-2",
              name: "Batter Fried Fish with Garlic Mayonnaise",
              description:
                "Golden fish fillets with crisp coating, served with roasted garlic mayo and pickled shallots.",
              image: "/customer/crispy-fish.svg",
              basePrice: 2550,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "sea-salad-3",
              name: "Prawn and Green Mango Toss",
              description:
                "Chilled prawns, sliced mango, cucumber ribbons, and roasted peanuts in a sweet chili dressing.",
              image: "/customer/grilled-prawns.svg",
              basePrice: 2680,
              spiceLevel: "Medium",
            }),
          ],
        },
        {
          id: "sea-soups",
          name: "Soups",
          description: "Comforting bowls finished with fresh coriander oil.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "sea-soup-1",
              name: "Lagoon Crab Sweet Corn Soup",
              description:
                "A thick sweet corn broth folded with hand-picked crab meat and spring onions.",
              image: "/customer/sea-soup.svg",
              basePrice: 1980,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "sea-soup-2",
              name: "Spiced Seafood Coconut Broth",
              description:
                "Prawns, squid, and reef fish simmered in coconut milk with pandan and curry leaf.",
              image: "/customer/sea-soup.svg",
              basePrice: 2240,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "sea-soup-3",
              name: "Smoked Tuna Tomato Consomme",
              description:
                "A clear tomato and basil broth with flakes of smoked tuna and charred sourdough crumbs.",
              image: "/customer/sea-soup.svg",
              basePrice: 1860,
              spiceLevel: "Mild",
            }),
          ],
        },
        {
          id: "sea-grill",
          name: "Grill",
          description: "Charcoal finishes with signature green sambol butter.",
          defaultExpanded: false,
          items: [
            createItem({
              id: "sea-grill-1",
              name: "Pepper Grilled Jumbo Prawns",
              description:
                "Jumbo prawns grilled over open flame and glazed with cracked pepper butter.",
              image: "/customer/grilled-prawns.svg",
              basePrice: 3480,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "sea-grill-2",
              name: "Coconut Chili Cuttlefish Skewers",
              description:
                "Tender cuttlefish skewers with coconut chili glaze and grilled lime.",
              image: "/customer/grilled-prawns.svg",
              basePrice: 3120,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "sea-grill-3",
              name: "Charred Reef Fish with Lime Butter",
              description:
                "Line-caught reef fish grilled whole and finished with citrus caper butter.",
              image: "/customer/sea-bowl.svg",
              basePrice: 3360,
              spiceLevel: "Mild",
            }),
          ],
        },
      ],
    },
    {
      id: "chicken",
      name: "Chicken",
      accentLabel: "House specials",
      description: "Comfort plates, grills, and rice favorites.",
      subcategories: [
        {
          id: "chicken-starters",
          name: "Starters",
          description: "Fast, crisp plates from the fryer and tandoor.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "chicken-starter-1",
              name: "Crispy Curry Leaf Chicken Bites",
              description:
                "Boneless chicken tossed with fried curry leaves, chili flakes, and toasted garlic.",
              image: "/customer/chicken-rice.svg",
              basePrice: 2140,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "chicken-starter-2",
              name: "Smoked Paprika Chicken Strips",
              description:
                "Crunchy chicken strips served with roasted pepper aioli and citrus slaw.",
              image: "/customer/chicken-rice.svg",
              basePrice: 2050,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "chicken-starter-3",
              name: "Clay Oven Chicken Tikka",
              description:
                "Charred tikka pieces marinated overnight in yogurt, fenugreek, and Kashmiri chili.",
              image: "/customer/chicken-rice.svg",
              basePrice: 2360,
              spiceLevel: "Medium",
            }),
          ],
        },
        {
          id: "chicken-rice",
          name: "Rice",
          description: "Signature rice bowls layered with sauces and sambols.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "chicken-rice-1",
              name: "Roasted Chicken Fried Rice",
              description:
                "Wok-fried rice with roasted chicken, leeks, sesame egg threads, and green onion oil.",
              image: "/customer/chicken-rice.svg",
              basePrice: 2420,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "chicken-rice-2",
              name: "Butter Chicken Pilaf Bowl",
              description:
                "Fragrant pilaf topped with velvety butter chicken sauce and herb yogurt.",
              image: "/customer/chicken-rice.svg",
              basePrice: 2780,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "chicken-rice-3",
              name: "Black Pepper Chicken Kottu",
              description:
                "Chopped roti, seared chicken, vegetables, and black pepper sauce finished on the griddle.",
              image: "/customer/chicken-rice.svg",
              basePrice: 2590,
              spiceLevel: "Hot",
            }),
          ],
        },
        {
          id: "chicken-curry",
          name: "Curry",
          description: "Rich gravies ready for rice, breads, or family-style sharing.",
          defaultExpanded: false,
          items: [
            createItem({
              id: "chicken-curry-1",
              name: "Village Chicken Curry",
              description:
                "Bone-in chicken in a roasted spice coconut curry with pandan and goraka.",
              image: "/customer/chicken-curry.svg",
              basePrice: 2860,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "chicken-curry-2",
              name: "Cashew Cream Chicken Masala",
              description:
                "A smoother masala with cashew cream, cardamom, and charred onions.",
              image: "/customer/chicken-curry.svg",
              basePrice: 2940,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "chicken-curry-3",
              name: "Lemongrass Chicken Stew",
              description:
                "Slow-braised chicken in a light coconut stew with lemongrass, carrots, and potatoes.",
              image: "/customer/chicken-curry.svg",
              basePrice: 2710,
              spiceLevel: "Mild",
            }),
          ],
        },
      ],
    },
    {
      id: "pork",
      name: "Pork",
      accentLabel: "Slow braised",
      description: "Rich cuts, crackling textures, and bold sauces.",
      subcategories: [
        {
          id: "pork-starters",
          name: "Starters",
          description: "Sharp, savory bites designed for sharing.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "pork-starter-1",
              name: "Crispy Pork Belly Cubes",
              description:
                "Twice-cooked pork belly with crackling skin, tamarind glaze, and green chili salt.",
              image: "/customer/pork-belly.svg",
              basePrice: 2480,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "pork-starter-2",
              name: "Honey Soy Pork Skewers",
              description:
                "Caramelized pork skewers brushed with honey soy and toasted sesame.",
              image: "/customer/pork-belly.svg",
              basePrice: 2320,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "pork-starter-3",
              name: "Smoked Bacon Chili Fries",
              description:
                "Seasoned fries loaded with smoked bacon crumble, cheddar cream, and pickled jalapeno.",
              image: "/customer/pork-belly.svg",
              basePrice: 2210,
              spiceLevel: "Hot",
            }),
          ],
        },
        {
          id: "pork-rice",
          name: "Rice",
          description: "Smoky bowls balanced with herbs and quick pickles.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "pork-rice-1",
              name: "Five Spice Pork Rice Bowl",
              description:
                "Braised pork slices on jasmine rice with bok choy, soy egg, and scallion relish.",
              image: "/customer/pork-belly.svg",
              basePrice: 2660,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "pork-rice-2",
              name: "Spicy Pork Kottu Roast",
              description:
                "Street-style chopped roti and pork with green chili, leeks, and house roast gravy.",
              image: "/customer/pork-belly.svg",
              basePrice: 2580,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "pork-rice-3",
              name: "Pineapple Glazed Pork Fried Rice",
              description:
                "Wok-fried rice with sweet pineapple, charred pork, cashews, and spring onion.",
              image: "/customer/pork-belly.svg",
              basePrice: 2490,
              spiceLevel: "Medium",
            }),
          ],
        },
        {
          id: "pork-curry",
          name: "Curry",
          description: "Deep sauces with roasted spices and gentle sweetness.",
          defaultExpanded: false,
          items: [
            createItem({
              id: "pork-curry-1",
              name: "Black Pork Curry",
              description:
                "A dark, roasted Sri Lankan curry with slow-cooked pork shoulder and cinnamon.",
              image: "/customer/pork-curry.svg",
              basePrice: 3010,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "pork-curry-2",
              name: "Caramel Onion Pork Braise",
              description:
                "Pork simmered with caramel onion, tomato, and warm whole spices until tender.",
              image: "/customer/pork-curry.svg",
              basePrice: 2880,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "pork-curry-3",
              name: "Coconut Vinegar Pork Stew",
              description:
                "A lighter pork stew brightened with coconut vinegar, shallots, and crushed pepper.",
              image: "/customer/pork-curry.svg",
              basePrice: 2760,
              spiceLevel: "Mild",
            }),
          ],
        },
      ],
    },
    {
      id: "beef",
      name: "Beef",
      accentLabel: "Slow cooked",
      description: "Braised, grilled, and pepper-forward beef plates.",
      subcategories: [
        {
          id: "beef-soups",
          name: "Soups",
          description: "Warming broths finished with marrow-rich depth.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "beef-soup-1",
              name: "Roasted Beef Bone Broth",
              description:
                "Clear bone broth simmered overnight with vegetables, herbs, and pepper oil.",
              image: "/customer/beef-stew.svg",
              basePrice: 1940,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "beef-soup-2",
              name: "Pepper Beef Noodle Soup",
              description:
                "Rice noodles and sliced beef in a fragrant pepper broth with greens.",
              image: "/customer/beef-stew.svg",
              basePrice: 2360,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "beef-soup-3",
              name: "Tomato Tamarind Beef Broth",
              description:
                "Slow-cooked tomato broth with tamarind, beef shreds, and coriander stems.",
              image: "/customer/beef-stew.svg",
              basePrice: 2190,
              spiceLevel: "Medium",
            }),
          ],
        },
        {
          id: "beef-curry",
          name: "Curry",
          description: "Robust gravies paired with coconut roti or steamed rice.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "beef-curry-1",
              name: "Slow Braised Beef Curry",
              description:
                "Long-braised beef in a roasted curry base with curry leaf, cinnamon, and clove.",
              image: "/customer/beef-stew.svg",
              basePrice: 3140,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "beef-curry-2",
              name: "Peppercorn Beef Masala",
              description:
                "Beef cubes in a thick masala sauce loaded with black pepper and ginger.",
              image: "/customer/beef-stew.svg",
              basePrice: 3260,
              spiceLevel: "Hot",
            }),
            createItem({
              id: "beef-curry-3",
              name: "Cashew Beef Korma",
              description:
                "A richer, creamier korma with toasted cashew paste and saffron rice pairing.",
              image: "/customer/beef-stew.svg",
              basePrice: 3380,
              spiceLevel: "Mild",
            }),
          ],
        },
        {
          id: "beef-grill",
          name: "Grill",
          description: "High-heat grills with basting sauces and smoked butter.",
          defaultExpanded: false,
          items: [
            createItem({
              id: "beef-grill-1",
              name: "Charred Beef Tenderloin Tips",
              description:
                "Tenderloin tips served medium with smoked butter and grilled onion petals.",
              image: "/customer/beef-stew.svg",
              basePrice: 3860,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "beef-grill-2",
              name: "Sticky Beef Ribs",
              description:
                "Slow-cooked ribs lacquered with tamarind barbecue glaze and sesame seeds.",
              image: "/customer/beef-stew.svg",
              basePrice: 3780,
              spiceLevel: "Medium",
            }),
            createItem({
              id: "beef-grill-3",
              name: "Black Pepper Beef Skillet",
              description:
                "Seared beef strips on a hot skillet with peppers, spring onions, and pan jus.",
              image: "/customer/beef-stew.svg",
              basePrice: 3420,
              spiceLevel: "Hot",
            }),
          ],
        },
      ],
    },
    {
      id: "desserts",
      name: "Desserts",
      accentLabel: "Sweet finish",
      description: "Soft textures, tropical fruit, and warm spice notes.",
      subcategories: [
        {
          id: "dessert-cakes",
          name: "Cakes",
          description: "House pastries plated for the table or takeaway.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "dessert-cake-1",
              name: "Warm Coconut Milk Tres Leches",
              description:
                "Soft sponge soaked in coconut milk, topped with palm sugar cream and toasted coconut.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1580,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "dessert-cake-2",
              name: "Dark Chocolate Spice Slice",
              description:
                "Dense chocolate cake with cinnamon cream and a thin cocoa caramel glaze.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1660,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "dessert-cake-3",
              name: "Mango Yogurt Gateau",
              description:
                "Layered mango gateau with vanilla sponge, chilled yogurt cream, and mint syrup.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1720,
              spiceLevel: "Mild",
            }),
          ],
        },
        {
          id: "dessert-cold",
          name: "Cold Desserts",
          description: "Chilled plates designed to balance spiced mains.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "dessert-cold-1",
              name: "Passionfruit Cheesecake Jar",
              description:
                "Velvety cheesecake layered with biscuit crumb and bright passionfruit curd.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1490,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "dessert-cold-2",
              name: "Vanilla Bean Curd with Palm Syrup",
              description:
                "Silky vanilla curd topped with warm palm syrup and sesame praline.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1380,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "dessert-cold-3",
              name: "Pineapple Sorbet Coupe",
              description:
                "House-churned pineapple sorbet with lime zest, basil sugar, and tropical fruit.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1320,
              spiceLevel: "Mild",
            }),
          ],
        },
        {
          id: "dessert-signature",
          name: "Signature",
          description: "Premium dessert plates for a longer finish.",
          defaultExpanded: false,
          items: [
            createItem({
              id: "dessert-signature-1",
              name: "Cinnamon Creme Brulee",
              description:
                "Baked custard perfumed with cinnamon bark and cracked caramel sugar.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1810,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "dessert-signature-2",
              name: "Watalappan Sundae",
              description:
                "Spiced jaggery custard served as a sundae with vanilla bean gelato and cashew crunch.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1940,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "dessert-signature-3",
              name: "Caramelized Banana Pancake Stack",
              description:
                "Mini pancake stack layered with caramel banana, nut brittle, and mascarpone cream.",
              image: "/customer/dessert-plate.svg",
              basePrice: 1760,
              spiceLevel: "Mild",
            }),
          ],
        },
      ],
    },
    {
      id: "drinks",
      name: "Drinks",
      accentLabel: "Fresh pours",
      description: "Coolers, coffee, teas, and house-made sodas.",
      subcategories: [
        {
          id: "drinks-coolers",
          name: "Coolers",
          description: "Refreshing tropical drinks for warm afternoons.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "drinks-cooler-1",
              name: "Lagoon Lime Mint Cooler",
              description:
                "A sparkling lime and mint cooler with cucumber ribbons and cane syrup.",
              image: "/customer/drink-tropical.svg",
              basePrice: 960,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "drinks-cooler-2",
              name: "Passionfruit Ginger Fizz",
              description:
                "Fresh passionfruit, ginger shrub, and soda served over pebble ice.",
              image: "/customer/drink-tropical.svg",
              basePrice: 1040,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "drinks-cooler-3",
              name: "Watermelon Basil Splash",
              description:
                "Cold-pressed watermelon juice with basil syrup and a pinch of sea salt.",
              image: "/customer/drink-tropical.svg",
              basePrice: 980,
              spiceLevel: "Mild",
            }),
          ],
        },
        {
          id: "drinks-coffee",
          name: "Coffee",
          description: "Short, strong, and dessert-friendly coffee service.",
          defaultExpanded: true,
          items: [
            createItem({
              id: "drinks-coffee-1",
              name: "Iced Cinnamon Latte",
              description:
                "Chilled espresso, textured milk, cinnamon syrup, and cocoa dust.",
              image: "/customer/drink-tropical.svg",
              basePrice: 1120,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "drinks-coffee-2",
              name: "Sea Salt Caramel Cold Brew",
              description:
                "Slow-steeped cold brew finished with caramel cream and a sea salt foam.",
              image: "/customer/drink-tropical.svg",
              basePrice: 1180,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "drinks-coffee-3",
              name: "Classic Flat White",
              description:
                "Double espresso with velvety steamed milk in a short ceramic cup.",
              image: "/customer/drink-tropical.svg",
              basePrice: 1050,
              spiceLevel: "Mild",
            }),
          ],
        },
        {
          id: "drinks-tea",
          name: "Tea",
          description: "Botanical infusions and local tea-house blends.",
          defaultExpanded: false,
          items: [
            createItem({
              id: "drinks-tea-1",
              name: "Ceylon Earl Grey Pot",
              description:
                "Single-estate Ceylon leaf brewed bright and fragrant with bergamot.",
              image: "/customer/drink-tropical.svg",
              basePrice: 880,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "drinks-tea-2",
              name: "Lemongrass Ginger Tea",
              description:
                "Fresh lemongrass, ginger, and kithul syrup served hot or chilled.",
              image: "/customer/drink-tropical.svg",
              basePrice: 840,
              spiceLevel: "Mild",
            }),
            createItem({
              id: "drinks-tea-3",
              name: "Rosella Hibiscus Infusion",
              description:
                "Tart rosella petals brewed with orange peel and a touch of honey.",
              image: "/customer/drink-tropical.svg",
              basePrice: 860,
              spiceLevel: "Mild",
            }),
          ],
        },
      ],
    },
  ],
};

export { createItem, servingSizes };

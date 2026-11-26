/**
 * THE TIMBER LIGHTS — OFFICIAL COMPLETE PRODUCT CATALOG
 * Collection 2026 • Volume 01 • Pages 06–12
 * All 25 Handcrafted Solid Ghana Teak Wood Lighting Fixtures
 * Divided into: Pendant (15), Lamp (4), Cluster (6)
 */

window.TIMBER_WOOD_POLISH_OPTIONS = [
  "Walnut", "Oak", "Teak", "Mahogany", "Cherry", "Maple", "Ash", "Cedar"
];

window.TIMBER_WOOD_COATING_OPTIONS = [
  "Laquer", "Melamine", "PU", "Wax"
];

window.TIMBER_COATING_FINISH_OPTIONS = [
  "Matt", "Semi", "Glossy"
];

window.TIMBER_SIZE_NOTE = "Size mentioned is net wood size. Bulb will be as per actual.";

(function () {
  const POLISH_TEXT = "Available in 8 Wood Polish Colors: Walnut, Oak, Teak, Mahogany, Cherry, Maple, Ash, Cedar";
  const COATING_TEXT = "Wood Coating Options: Laquer, Melamine, PU, Wax (Matt / Semi / Glossy) — Any finish can be achieved on selected polish color";
  const SIZE_NOTE = "Size mentioned is net wood size. Bulb will be as per actual.";

  const RAW_CATALOG = [
    // ── PAGE 06 ─────────────────────────────────────────────────────
    {
      id: "hg1057", model: "HG1057", page: 6, height: '15"', price: 21000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "HG1057 Hand-Lathed Baluster & Flared Shade Pendant",
      image: "images/products/hg1057.jpg",
      shortDesc: "Architectural turned solid Ghana Teak pendant with sculpted baluster spire, ringed waist, and wide flared reflector cap."
    },
    {
      id: "hg1589", model: "HG1589", page: 6, height: '15"', price: 11000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "HG1589 Slim Sculpted Spindle Pendant",
      image: "images/products/hg1589.jpg",
      shortDesc: "Slender hand-turned solid Ghana Teak spindle pendant featuring a tapered waist and warm filament downlight."
    },
    {
      id: "kg3058", model: "KG3058", page: 6, height: '15"', price: 25000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "KG3058 Tiered Drum & Finial Pendant",
      image: "images/products/kg3058.jpg",
      shortDesc: "Bold solid Ghana Teak pendant combining a multi-ringed finial top with a deep turned drum shade and brass collar."
    },

    // ── PAGE 07 ─────────────────────────────────────────────────────
    {
      id: "hg8166", model: "HG8166", page: 7, height: '15"', price: 28000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "HG8166 Grand Baluster & Wide Saucer Pendant",
      image: "images/products/hg8166.jpg",
      shortDesc: "Statement solid Ghana Teak pendant with classic stepped baluster neck and wide circular bevelled shade."
    },
    {
      id: "hg2865", model: "HG2865", page: 7, height: '10"', price: 33000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "HG2865 Double-Disc Architectural Canopy Pendant",
      image: "images/products/hg2865.jpg",
      shortDesc: "Low-profile 10\" sculptural solid Ghana Teak pendant with dual flared disc tiers for wide ambient glow."
    },
    {
      id: "hg2685", model: "HG2685", page: 7, height: '8"', price: 25000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "HG2685 Compact Dual-Disc Pendant",
      image: "images/products/hg2685.jpg",
      shortDesc: "Compact 8\" solid Ghana Teak dual-disc pendant engineered for dining tables, islands, and bedside drops."
    },
    {
      id: "hh7328", model: "HH7328", page: 7, height: '15"', price: 17000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "HH7328 Teardrop & Disc Totem Pendant",
      image: "images/products/hh7328.jpg",
      shortDesc: "Organic light-toned solid Ghana Teak pendant stacking a teardrop spire, rounded beads, and a slender disc."
    },

    // ── PAGE 08 ─────────────────────────────────────────────────────
    {
      id: "fg5816", model: "FG5816", page: 8, height: '15"', price: 15000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "FG5816 Dual-Tone Ribbed Totem Pendant",
      image: "images/products/fg5816.jpg",
      shortDesc: "Contemporary solid Ghana Teak pendant alternating natural spheres, ribbed discs, and a dark cylindrical socket housing."
    },
    {
      id: "er4856", model: "ER4856", page: 8, height: '12"', price: 14000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "ER4856 Stacked Sphere & Ring Pendant",
      image: "images/products/er4856.jpg",
      shortDesc: "12\" hand-lathed solid Ghana Teak bead column finished with twin torus rings and a solid timber socket barrel."
    },
    {
      id: "ad5856", model: "AD5856", page: 8, height: '15"', price: 18000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "AD5856 Classical Urn & Brass Collar Pendant",
      image: "images/products/ad5856.jpg",
      shortDesc: "15\" heritage turned solid Ghana Teak silhouette featuring a flared urn body, curved waist, and brushed brass socket."
    },

    // ── PAGE 09 ─────────────────────────────────────────────────────
    {
      id: "sh5382", model: "SH5382", page: 9, height: '20"', price: 15000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "SH5382 Tall Geometric Bicone Pendant",
      image: "images/products/sh5382.jpg",
      shortDesc: "20\" tall architectural solid Ghana Teak pendant sculpted with alternating bicone facets and disc rings."
    },
    {
      id: "gud2583", model: "GUD2583", page: 9, height: '8"', price: 7000,
      category: "lamp", categoryLabel: "Lamp Light",
      title: "GUD2583 Bell Dome Wooden Lamp",
      image: "images/products/gud2583.jpg",
      shortDesc: "8\" compact bell-shaped solid Ghana Teak dome lamp that casts a warm, focused downward pool of light."
    },
    {
      id: "dg5956", model: "DG5956", page: 9, height: '8"', price: 8000,
      category: "lamp", categoryLabel: "Lamp Light",
      title: "DG5956 Spiral Twist Globe Lamp",
      image: "images/products/dg5956.jpg",
      shortDesc: "8\" helical carved solid Ghana Teak lamp paired with an exposed warm-glow filament globe."
    },

    // ── PAGE 10 ─────────────────────────────────────────────────────
    {
      id: "gw8936", model: "GW8936", page: 10, height: '20"', price: 16000,
      category: "cluster", categoryLabel: "Cluster Light",
      title: "GW8936 Artisan Totem Trio Cluster",
      image: "images/products/gw8936.jpg",
      shortDesc: "20\" multi-drop solid Ghana Teak cluster series featuring contrasting lathed disc, bead, and faceted drops."
    },
    {
      id: "ve6168", model: "VE6168", page: 10, height: '24"', price: 19000,
      category: "cluster", categoryLabel: "Cluster Light",
      title: "VE6168 Beaded Column Cluster",
      image: "images/products/ve6168.jpg",
      shortDesc: "24\" slender solid Ghana Teak beaded cluster drop crafted for double-height foyers and staircase voids."
    },
    {
      id: "sg4236", model: "SG4236", page: 10, height: '24"', price: 15000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "SG4236 Stacked Disc & Bead Pendant",
      image: "images/products/sg4236.jpg",
      shortDesc: "24\" rhythmic solid Ghana Teak pendant combining graduated turned discs with warm spherical spacer beads."
    },
    {
      id: "gr2569", model: "GR2569", page: 10, height: '20"', price: 15000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "GR2569 Conical Totem & Cylinder Pendant",
      image: "images/products/gr2569.jpg",
      shortDesc: "20\" solid Ghana Teak pendant pairing a tapered dark timber cone with stacked bicone discs."
    },
    {
      id: "ce5569", model: "CE5569", page: 10, height: '24"', price: 19000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "CE5569 Tall Faceted Diamond Pendant",
      image: "images/products/ce5569.jpg",
      shortDesc: "24\" statement solid Ghana Teak pendant featuring bold diamond-profiled timber discs and brass-ready socket."
    },

    // ── PAGE 11 ─────────────────────────────────────────────────────
    {
      id: "fe1886", model: "FE1886", page: 11, height: '12"', price: 11000,
      category: "lamp", categoryLabel: "Lamp Light",
      title: "FE1886 Triple Hemisphere Bowl Lamp",
      image: "images/products/fe1886.jpg",
      shortDesc: "12\" sculptural solid Ghana Teak lamp formed from three stacked hemispherical bowls and a cylindrical base."
    },
    {
      id: "fw2485", model: "FW2485", page: 11, height: '10"', price: 11000,
      category: "lamp", categoryLabel: "Lamp Light",
      title: "FW2485 Twin Torus Compact Lamp",
      image: "images/products/fw2485.jpg",
      shortDesc: "10\" minimalist solid Ghana Teak lamp with twin rounded cushion rings and an elongated timber neck."
    },
    {
      id: "ge3256", model: "GE3256", page: 11, height: '20"', price: 15000,
      category: "pendant", categoryLabel: "Pendant Light",
      title: "GE3256 Ribbed & Spherical Bead Pendant",
      image: "images/products/ge3256.jpg",
      shortDesc: "20\" solid Ghana Teak pendant blending top and bottom ribbed collars with five smooth turned spheres."
    },

    // ── PAGE 12 ─────────────────────────────────────────────────────
    {
      id: "ks5855", model: "KS5855", page: 12, height: '8"', price: 10000,
      priceUnit: "MRP / Piece (Incl. of all taxes)",
      category: "cluster", categoryLabel: "Cluster Light",
      title: "KS5855 Grooved Saucer Trio Cluster (Per Piece)",
      image: "images/products/ks5855.jpg",
      shortDesc: "8\" concentric-grooved solid Ghana Teak saucer light ideal for staggered 3-piece clusters over dining tables."
    },
    {
      id: "rk2632", model: "RK2632", page: 12, height: '24"', price: 18000,
      category: "cluster", categoryLabel: "Cluster Light",
      title: "RK2632 Geometric Cone & Bead Cluster",
      image: "images/products/rk2632.jpg",
      shortDesc: "24\" architectural solid Ghana Teak cluster drop mixing triangular cones, bicones, and natural spheres."
    },
    {
      id: "rk1866", model: "RK1866", page: 12, height: '24"', price: 18000,
      category: "cluster", categoryLabel: "Cluster Light",
      title: "RK1866 Sculptural Block & Disc Cluster",
      image: "images/products/rk1866.jpg",
      shortDesc: "24\" mixed-geometry solid Ghana Teak cluster drop crafted for bespoke multi-pendant installations."
    },
    {
      id: "rk2985", model: "RK2985", page: 12, height: '24"', price: 18000,
      category: "cluster", categoryLabel: "Cluster Light",
      title: "RK2985 Asymmetric Totem Cluster",
      image: "images/products/rk2985.jpg",
      shortDesc: "24\" handcrafted solid Ghana Teak cluster featuring alternating timber blocks, cones, and spherical beads."
    }
  ];

  window.TIMBER_PRODUCTS = RAW_CATALOG.map((item) => ({
    id: item.id,
    model: item.model,
    name: `The Timber Lights — ${item.title}`,
    height: item.height,
    wood: "Premium Ghana Teak Wood",
    price: item.price,
    priceUnit: item.priceUnit || "MRP (Incl. of all taxes)",
    category: item.category,
    categoryLabel: item.categoryLabel,
    image: item.image,
    page: item.page,
    isFeatured: true,
    stock: 20,
    rating: 5,
    reviewsCount: 32,
    sizeNote: SIZE_NOTE,
    shortDesc: item.shortDesc,
    features: [
      `Model ${item.model} — ${item.categoryLabel} (Catalog Page ${String(item.page).padStart(2, "0")})`,
      `Net Wood Height: ${item.height} | 100% Solid Premium Ghana Teak Wood`,
      POLISH_TEXT,
      COATING_TEXT,
      SIZE_NOTE,
      "3-Year Comprehensive Craftsmanship Warranty"
    ],
    specifications: {
      "Model Number": item.model,
      "Category": item.categoryLabel,
      "Net Wood Height": item.height,
      "Wood Material": "Premium Ghana Teak Wood",
      "Polish Colors (8)": "Walnut, Oak, Teak, Mahogany, Cherry, Maple, Ash, Cedar",
      "Coatings (4)": "Laquer, Melamine, PU, Wax (Matt / Semi / Glossy)",
      "MRP": `₹${item.price.toLocaleString("en-IN")}${item.priceUnit && item.priceUnit.includes("Piece") ? " / Piece" : ""}`,
      "Catalog Page": `Page ${String(item.page).padStart(2, "0")}`
    }
  }));
})();

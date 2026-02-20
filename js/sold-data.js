// ═══════════════════════════════════════════════════════════
//  SOLD INVENTORY DATA
//  Reverse chronological — most recent first
// ═══════════════════════════════════════════════════════════

var soldItems = [
  {
    brand: "Natuzzi Editions",
    title: "Vigore Top-Grain Leather Sectional",
    description: "A bold and contemporary Italian sectional from Natuzzi Editions, upholstered in top-grain leather with a warm cognac tone. The Vigore features deep, generously cushioned seats and a refined silhouette that commands any living room. Built in Italy to Natuzzi's exacting standards.",
    images: [
      "../images/Sold Inventory/NE-040/IMG_6136.jpeg",
      "../images/Sold Inventory/NE-040/IMG_6134.jpeg",
      "../images/Sold Inventory/NE-040/IMG_6138.jpeg",
      "../images/Sold Inventory/NE-040/IMG_6114.jpeg",
      "../images/Sold Inventory/NE-040/IMG_6110.jpeg",
      "../images/Sold Inventory/NE-040/IMG_6111.jpeg",
      "../images/Sold Inventory/NE-040/IMG_6112.jpeg",
      "../images/Sold Inventory/NE-040/IMG_6113.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Saggezza Semi-Aniline Leather Loveseat",
    description: "The Saggezza loveseat from Natuzzi Editions is upholstered in luxurious semi-aniline leather, which is softer and more natural in appearance than standard top-grain. Semi-aniline leather retains the hide's natural markings while offering a protective coating for durability — the best of both worlds for everyday luxury seating.",
    images: [
      "../images/Sold Inventory/NE-039/IMG_6092.jpeg",
      "../images/Sold Inventory/NE-039/IMG_6093.jpeg",
      "../images/Sold Inventory/NE-039/IMG_6089.jpeg",
      "../images/Sold Inventory/NE-039/IMG_6083.jpeg",
      "../images/Sold Inventory/NE-039/IMG_6085.jpeg",
      "../images/Sold Inventory/NE-039/IMG_6088.jpeg",
      "../images/Sold Inventory/NE-039/IMG_6090.jpeg",
      "../images/Sold Inventory/NE-039/IMG_6091.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Saggezza Semi-Aniline Leather Sofa",
    description: "Natuzzi Editions' Saggezza sofa in semi-aniline leather — a step above top-grain, with a softer hand feel and richer depth of colour. The clean, contemporary lines and tight back cushions give this piece a tailored, sophisticated look that fits equally well in modern and transitional interiors.",
    images: [
      "../images/Sold Inventory/NE-038/IMG_6101.jpeg",
      "../images/Sold Inventory/NE-038/IMG_6097.jpeg",
      "../images/Sold Inventory/NE-038/IMG_6098.jpeg",
      "../images/Sold Inventory/NE-038/IMG_6100.jpeg",
    ]
  },
  {
    brand: "Crate & Barrel",
    title: "Rochelle Sofa & Chair Set",
    description: "The Rochelle collection from Crate & Barrel is a perennial favourite — classic track arms, tight back cushions, and a sturdy hardwood frame give this sofa and chair set an enduring, transitional appeal. Upholstered in a neutral fabric that works with virtually any palette. A reliable, well-built Canadian retail staple.",
    images: [
      "../images/Sold Inventory/CB-037/IMG_6034.jpeg",
      "../images/Sold Inventory/CB-037/IMG_6040.jpeg",
      "../images/Sold Inventory/CB-037/IMG_6055.jpeg",
      "../images/Sold Inventory/CB-037/IMG_6044.jpeg",
      "../images/Sold Inventory/CB-037/IMG_6035.jpeg",
      "../images/Sold Inventory/CB-037/IMG_6036.jpeg",
      "../images/Sold Inventory/CB-037/IMG_6053.jpeg",
    ]
  },
  {
    brand: "Brentwood Classics",
    title: "Dorado Full Aniline Capetown Antico Leather",
    description: "One of the finest leather grades available — full aniline Capetown Antico leather from Brentwood Classics' Dorado collection. Full aniline leather is dyed exclusively with soluble dyes and receives no pigment coating, meaning it breathes, softens with age, and develops a one-of-a-kind patina. A truly heirloom-quality Canadian-made piece.",
    images: [
      "../images/Sold Inventory/BC-036/IMG_5972.jpeg",
      "../images/Sold Inventory/BC-036/IMG_5981.jpeg",
      "../images/Sold Inventory/BC-036/IMG_5985.jpeg",
      "../images/Sold Inventory/BC-036/IMG_5973.jpeg",
      "../images/Sold Inventory/BC-036/IMG_5974.jpeg",
      "../images/Sold Inventory/BC-036/IMG_5978.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Saggezza Top-Grain Leather Sectional",
    description: "A handsome L-shaped sectional from Natuzzi Editions in the enduring Saggezza model, upholstered in top-grain leather. Saggezza's wide seats, low profile, and clean Italian lines make it one of Natuzzi's most versatile designs. Sourced locally and sold to a lucky Edmonton home.",
    images: [
      "../images/Sold Inventory/NE-034/IMG_5956.jpeg",
      "../images/Sold Inventory/NE-034/IMG_5958.jpeg",
      "../images/Sold Inventory/NE-034/IMG_5960.jpeg",
      "../images/Sold Inventory/NE-034/IMG_5962.jpeg",
    ]
  },
  {
    brand: "Rove Concepts",
    title: "Milo Modular Sectional",
    description: "The Milo from Rove Concepts is a fan-favourite modular sectional known for its low, sleek profile and deep, lounge-worthy seats. Upholstered in a performance fabric and built on solid wood legs, the Milo achieves the mid-century modern aesthetic without sacrificing everyday comfort. A strong resale piece.",
    images: [
      "../images/Sold Inventory/RC-033/IMG_5860.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5861.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5862.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5863.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5864.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5865.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5866.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5868.jpeg",
      "../images/Sold Inventory/RC-033/IMG_5869.jpeg",
    ]
  },
  {
    brand: "American Leather",
    title: "Tuscany Top-Grain Blackberry Leather Sofa",
    description: "American Leather's Tuscany sofa in a rich Blackberry top-grain leather — a striking, deep jewel-toned upholstery that makes an immediate statement. American Leather is a Texas-based manufacturer known for quality construction, customizable options, and their Comfort Sleeper line. The Tuscany is their flagship stationary sofa silhouette.",
    images: [
      "../images/Sold Inventory/AL-032/IMG_5834.jpeg",
      "../images/Sold Inventory/AL-032/IMG_5842.jpeg",
      "../images/Sold Inventory/AL-032/IMG_5836.jpeg",
      "../images/Sold Inventory/AL-032/IMG_5837.jpeg",
      "../images/Sold Inventory/AL-032/IMG_5838.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Cesare Top-Grain Leather Sectional",
    description: "The Cesare is one of Natuzzi Editions' more dramatic offerings — a large-scale, contemporary sectional with bold proportions, wide chaise, and thick cushioning. Upholstered in top-grain leather with a refined matte finish. If you want presence in a room, the Cesare delivers it effortlessly.",
    images: [
      "../images/Sold Inventory/NE-031/IMG_5782.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5787.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5789.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5790.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5791.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5792.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5796.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5788.jpeg",
      "../images/Sold Inventory/NE-031/IMG_5797.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Saggezza Top-Grain Leather Sectional",
    description: "Another Saggezza sectional placed into a great Edmonton home — a testament to how consistently popular this Natuzzi Editions model is. Top-grain leather, Italian craftsmanship, and a layout that works beautifully in both open-concept and defined living spaces. The Saggezza is a repeat seller for us.",
    images: [
      "../images/Sold Inventory/NE-029/IMG_5480.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5481.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5483.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5484.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5487.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5488.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5489.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5482.jpeg",
      "../images/Sold Inventory/NE-029/IMG_5490.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Indimenticabile Top-Grain Leather Sofa",
    description: "The Indimenticabile — Italian for 'unforgettable' — lives up to its name. This Natuzzi Editions sofa features an elegantly tapered silhouette, tight cushioning, and top-grain leather upholstery. Its restrained proportions make it equally at home in a condo or a formal living room.",
    images: [
      "../images/Sold Inventory/NE-028/IMG_5463.jpeg",
      "../images/Sold Inventory/NE-028/IMG_5466.jpeg",
      "../images/Sold Inventory/NE-028/IMG_5469.jpeg",
      "../images/Sold Inventory/NE-028/IMG_5471.jpeg",
      "../images/Sold Inventory/NE-028/IMG_5473.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Sollievo Top-Grain Leather Sofa",
    description: "Sollievo means 'relief' in Italian — and this Natuzzi Editions sofa earns it. Designed with comfort as the priority, the Sollievo has a softer, more relaxed seat profile compared to Natuzzi's tailored models, while still maintaining the top-grain leather upholstery and Italian construction the brand is known for.",
    images: [
      "../images/Sold Inventory/NE-026/IMG_5199.jpeg",
      "../images/Sold Inventory/NE-026/IMG_5202.jpeg",
      "../images/Sold Inventory/NE-026/IMG_5203.jpeg",
      "../images/Sold Inventory/NE-026/IMG_5205.jpeg",
      "../images/Sold Inventory/NE-026/IMG_5208.jpeg",
    ]
  },
  {
    brand: "Natuzzi Editions",
    title: "Indimenticabile Top-Grain Leather Sofa",
    description: "A second Indimenticabile through our doors — further proof of the model's timeless appeal. This Natuzzi Editions sofa pairs refined Italian design with top-grain leather upholstery and an understated profile that complements rather than overpowers a room. Clean, elegant, and built to last.",
    images: [
      "../images/Sold Inventory/NE-025/IMG_5182.jpeg",
      "../images/Sold Inventory/NE-025/IMG_5180.jpeg",
      "../images/Sold Inventory/NE-025/IMG_5185.jpeg",
      "../images/Sold Inventory/NE-025/IMG_5186.jpeg",
      "../images/Sold Inventory/NE-025/IMG_5187.jpeg",
    ]
  },
  {
    brand: "Fabbrica",
    title: "Charcoal Performance Fabric Sofa + Chaise",
    description: "A practical and good-looking sofa and chaise combination from Fabbrica, upholstered in a durable charcoal performance fabric. Performance fabric is engineered to resist stains, pilling, and wear — ideal for households with kids or pets. Fabbrica is a respected Canadian upholstery manufacturer known for customizable, contract-grade builds.",
    images: [
      "../images/Sold Inventory/FS-022/IMG_5363.jpeg",
      "../images/Sold Inventory/FS-022/IMG_5061.jpeg",
      "../images/Sold Inventory/FS-022/IMG_5062.jpeg",
      "../images/Sold Inventory/FS-022/IMG_5067.jpeg",
      "../images/Sold Inventory/FS-022/IMG_5070.jpeg",
      "../images/Sold Inventory/FS-022/IMG_5071.jpeg",
      "../images/Sold Inventory/FS-022/IMG_5072.jpeg",
      "../images/Sold Inventory/FS-022/IMG_5366.jpeg",
    ]
  },
  {
    brand: "Crate & Barrel",
    title: "Gather 99 inch Deep Sofa Tribute, Quartz Fabric",
    description: "Crate & Barrel's Gather sofa in the deep 99-inch configuration — one of their most beloved models for its extra depth and sink-in comfort. Upholstered in Tribute Quartz, a warm, textured fabric, this sofa is built for long evenings at home. At 99 inches, it seats four comfortably.",
    images: [
      "../images/Sold Inventory/CB-021/IMG_5099.jpeg",
      "../images/Sold Inventory/CB-021/IMG_5098.jpeg",
      "../images/Sold Inventory/CB-021/IMG_5101.jpeg",
      "../images/Sold Inventory/CB-021/IMG_5102.jpeg",
      "../images/Sold Inventory/CB-021/IMG_5103.jpeg",
      "../images/Sold Inventory/CB-021/IMG_5105.jpeg",
    ]
  },
  {
    brand: "Flexsteel",
    title: "Power Headrest & Rocker Recliner",
    description: "A premium power recliner from Flexsteel, featuring both a motorized headrest and full rocking mechanism — rare features in the same chair. Flexsteel is an American manufacturer with over 130 years of history, renowned for their patented Blue Steel Spring foundation. This recliner is engineered for daily use and long-term comfort.",
    images: [
      "../images/Sold Inventory/FR-023/IMG_5148.jpeg",
      "../images/Sold Inventory/FR-023/IMG_5152.jpeg",
      "../images/Sold Inventory/FR-023/IMG_5153.jpeg",
      "../images/Sold Inventory/FR-023/IMG_5155.jpeg",
    ]
  },
  {
    brand: "Urban Barn",
    title: "Preston Distressed Top-Grain Leather Sofa & Chair set",
    description: "Urban Barn's Preston collection in distressed top-grain leather — a character-rich, lived-in aesthetic with real substance underneath. The distressing is intentional and beautiful, giving each piece a unique finish that only improves with age. Sold as a matching sofa and accent chair set, perfect for a cohesive living room look.",
    images: [
      "../images/Sold Inventory/UB-019/IMG_4916.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4917.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4918.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4919.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4920.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4922.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4923.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4924.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4925.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4928.jpeg",
      "../images/Sold Inventory/UB-019/IMG_4929.jpeg",
    ]
  },
  {
    brand: "EQ3",
    title: "Remi Top-Grain Leather Sofa",
    description: "EQ3's Remi sofa is a clean, Scandinavian-influenced design with top-grain leather upholstery and solid wood legs. EQ3 is a Canadian brand that emphasises thoughtful design at an accessible price point — and the Remi embodies that well. Low arms, an airy base, and quality stitching give it a premium look that punches above its original retail price.",
    images: [
      "../images/Sold Inventory/EQ-017/IMG_4815.jpeg",
      "../images/Sold Inventory/EQ-017/IMG_4772.jpeg",
      "../images/Sold Inventory/EQ-017/IMG_4773.jpeg",
      "../images/Sold Inventory/EQ-017/IMG_4813.jpeg",
    ]
  },
  {
    brand: "Urban Barn",
    title: "Karis Fabric Sofa",
    description: "The Karis sofa from Urban Barn in a warm, textured fabric upholstery. A mid-sized, track-arm design with a casual contemporary feel — the kind of sofa that works in a den, basement, or second living space as easily as a main room. Solid everyday seating from one of Canada's most recognisable furniture retailers.",
    images: [
      "../images/Sold Inventory/UB-015/IMG_4682.jpeg",
      "../images/Sold Inventory/UB-015/IMG_4683.jpeg",
      "../images/Sold Inventory/UB-015/IMG_4684.jpeg",
      "../images/Sold Inventory/UB-015/IMG_4685.jpeg",
      "../images/Sold Inventory/UB-015/IMG_4686.jpeg",
      "../images/Sold Inventory/UB-015/IMG_4688.jpeg",
    ]
  },
  {
    brand: "Urban Barn",
    title: "Renfrew 94 inch Top-Grain Leather Sofa",
    description: "Urban Barn's Renfrew sofa at a generous 94 inches, upholstered in top-grain leather. The Renfrew is one of Urban Barn's best-selling leather frames — notable for its wide track arms, clean silhouette, and durable construction. At 94 inches it seats three adults comfortably with room to spare.",
    images: [
      "../images/Sold Inventory/UB-014/IMG_4550.jpeg",
      "../images/Sold Inventory/UB-014/IMG_4551.jpeg",
      "../images/Sold Inventory/UB-014/IMG_4552.jpeg",
      "../images/Sold Inventory/UB-014/IMG_4553.jpeg",
      "../images/Sold Inventory/UB-014/IMG_4554.jpeg",
    ]
  },
  {
    brand: "EQ3",
    title: "Replay 99 inch Sofa",
    description: "EQ3's Replay sofa at a full 99 inches — one of their larger frames and a great choice for anyone who needs serious seating capacity without sacrificing design. The Replay features removable cushion covers, solid legs, and EQ3's signature clean-line aesthetic. Canadian-made comfort that holds its value well.",
    images: [
      "../images/Sold Inventory/EQ-013/IMG_4576.jpeg",
      "../images/Sold Inventory/EQ-013/IMG_4578.jpeg",
      "../images/Sold Inventory/EQ-013/IMG_4580.jpeg",
      "../images/Sold Inventory/EQ-013/IMG_4582.jpeg",
      "../images/Sold Inventory/EQ-013/IMG_4604.jpeg",
    ]
  },
  {
    brand: "Urban Barn",
    title: "Grey Tufted Fabric Sofa Wood Base",
    description: "A classically styled tufted fabric sofa from Urban Barn in a versatile grey, elevated on an exposed wood base. Button tufting on the back cushions gives this piece a traditional, tailored character, while the natural wood legs keep it feeling current. A great transitional piece that bridges classic and contemporary design.",
    images: [
      "../images/Sold Inventory/UB-011/IMG_4432.jpeg",
      "../images/Sold Inventory/UB-011/IMG_4433.jpeg",
      "../images/Sold Inventory/UB-011/IMG_4434.jpeg",
      "../images/Sold Inventory/UB-011/IMG_4435.jpeg",
    ]
  },
  {
    brand: "La-Z-Boy",
    title: "Violet Stationary Sofa",
    description: "La-Z-Boy's Violet is a comfort-forward stationary sofa built on their well-tested frame construction. La-Z-Boy is one of North America's most trusted upholstery brands, and the Violet reflects that reputation — solid hardwood frame, sinuous spring base, and plush cushioning in a straightforward silhouette that suits virtually any living room.",
    images: [
      "../images/Sold Inventory/LB-008/IMG_4190.jpeg",
      "../images/Sold Inventory/LB-008/IMG_4191.jpeg",
      "../images/Sold Inventory/LB-008/IMG_4187.jpeg",
      "../images/Sold Inventory/LB-008/IMG_4188.jpeg",
      "../images/Sold Inventory/LB-008/IMG_4189.jpeg",
    ]
  },
  {
    brand: "Natuzzi Italia",
    title: "Full-Grain Aniline Leather Loveseat Set",
    description: "A rare find — a loveseat set from Natuzzi Italia, the premium parent brand above Natuzzi Editions, upholstered in full-grain aniline leather. This is the pinnacle of leather quality: undyed hides selected for their natural beauty, with zero surface coating. The result is a supple, breathing leather that develops a rich patina over decades. Italian luxury at its finest.",
    images: [
      "../images/Sold Inventory/NI-006/IMG_4213.jpeg",
      "../images/Sold Inventory/NI-006/IMG_4216.jpeg",
      "../images/Sold Inventory/NI-006/IMG_4218.jpeg",
      "../images/Sold Inventory/NI-006/IMG_4219.jpeg",
      "../images/Sold Inventory/NI-006/IMG_4223.jpeg",
      "../images/Sold Inventory/NI-006/IMG_4224.jpeg",
      "../images/Sold Inventory/NI-006/IMG_4225.jpeg",
    ]
  },
  {
    brand: "Teak Design",
    title: "Mid-Century Teak Dresser Set",
    description: "A beautifully preserved mid-century teak dresser set — the kind of piece that defined Scandinavian furniture design in the 1960s and 70s. Solid teak construction with dovetail joinery, tapered legs, and that unmistakable warm honey-brown grain. Sold as a matching set, these pieces are as functional as they are iconic.",
    images: [
      "../images/Sold Inventory/TD-001/IMG_3651.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3652.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3654.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3637.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3638.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3646.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3647.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3648.jpeg",
      "../images/Sold Inventory/TD-001/IMG_3653.jpeg",
    ]
  },
  {
    brand: "Farstrup",
    title: "Teak Extendable Leaf Dining Table",
    description: "A stunning extendable dining table from Farstrup, the venerable Danish furniture manufacturer. Solid teak construction with a self-storing leaf mechanism that extends the table for entertaining, then tucks away cleanly. Farstrup has been crafting Scandinavian furniture since 1931 — this table is built to last another lifetime.",
    images: [
      "../images/Sold Inventory/TT-018/IMG_4861.jpeg",
      "../images/Sold Inventory/TT-018/IMG_4863.jpeg",
      "../images/Sold Inventory/TT-018/IMG_4867.jpeg",
      "../images/Sold Inventory/TT-018/IMG_4868.jpeg",
      "../images/Sold Inventory/TT-018/IMG_4871.jpeg",
      "../images/Sold Inventory/TT-018/IMG_4872.jpeg",
      "../images/Sold Inventory/TT-018/IMG_4873.jpeg",
    ]
  },
  {
    brand: "Mid-Century Teak Credena",
    title: "Teak Record Cabinet",
    description: "A gorgeous mid-century teak record cabinet — the ultimate piece for vinyl enthusiasts who also appreciate great furniture design. Featuring open lower shelving sized perfectly for LP storage, solid teak frame, and the elegant tapered legs characteristic of Danish design from the 1960s. Functional, collectible, and endlessly stylish.",
    images: [
      "../images/Sold Inventory/TC-012/IMG_4584.jpeg",
      "../images/Sold Inventory/TC-012/IMG_4585.jpeg",
      "../images/Sold Inventory/TC-012/IMG_4586.jpeg",
      "../images/Sold Inventory/TC-012/IMG_4587.jpeg",
      "../images/Sold Inventory/TC-012/IMG_4588.jpeg",
      "../images/Sold Inventory/TC-012/IMG_4592.jpeg",
      "../images/Sold Inventory/TC-012/IMG_4594.jpeg",
    ]
  },
  {
    brand: "Mid-Century Danish Teak Dresser",
    title: "Teak 5-Drawer Dresser",
    description: "A handsome 5-drawer dresser in solid Danish teak — a staple of mid-century Scandinavian bedroom furniture. Five graduated drawers with clean recessed pulls, solid teak carcass, and tapered legs that lift the piece off the floor for an airy, timeless look. In excellent condition and ready for decades more of daily use.",
    images: [
      "../images/Sold Inventory/TD-007/IMG_4615.jpeg",
      "../images/Sold Inventory/TD-007/IMG_4296.jpeg",
      "../images/Sold Inventory/TD-007/IMG_4291.jpeg",
      "../images/Sold Inventory/TD-007/IMG_4616.jpeg",
      "../images/Sold Inventory/TD-007/IMG_4617.jpeg",
      "../images/Sold Inventory/TD-007/IMG_4619.jpeg",
      "../images/Sold Inventory/TD-007/IMG_4620.jpeg",
      "../images/Sold Inventory/TD-007/IMG_4622.jpeg",
    ]
  },
];


// ═══════════════════════════════════════════════════════════
//  RENDER
// ═══════════════════════════════════════════════════════════

function renderSold() {
  var grid = document.getElementById('sold-grid');

  if (soldItems.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">' +
      '<p>Sold items will appear here.</p>' +
    '</div>';
    return;
  }

  grid.innerHTML = soldItems.map(function(item) {
    return '<div class="card sold">' +
      '<span class="sold-badge">Sold</span>' +
      (item.images && item.images.length > 0
        ? buildCarousel(item.images, item.brand + ' ' + item.title)
        : '<div class="card-image-placeholder">Photo</div>'
      ) +
      '<div class="card-body">' +
        '<div class="card-brand">' + item.brand + '</div>' +
        '<div class="card-title">' + item.title + '</div>' +
        (item.description ? '<div class="card-description">' + item.description + '</div>' : '') +
      '</div>' +
    '</div>';
  }).join('');
}

renderSold();

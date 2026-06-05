/**
 * FAQ source of truth for the homepage, sell hub, and about page.
 *
 * Each entry produces BOTH the visible <section class="faq-section"> markup
 * and the JSON-LD FAQPage schema in <head>. build.js writes them between
 * marker comments so they cannot drift apart.
 *
 * Fields:
 *   question        — visible question text
 *   answer          — visible answer text. Use Unicode chars (—, ', ") directly;
 *                     build-time escaping handles entities. Use [text](url) for
 *                     inline links — they become <a> in HTML and plain text in schema.
 *   schemaQuestion  — optional override for the JSON-LD "name" field. Use when
 *                     the schema benefits from more keyword-rich phrasing (e.g.
 *                     "...in Edmonton?") than the conversational visible text.
 *   schemaAnswer    — optional override for the JSON-LD "text" field. Defaults
 *                     to a plain-text rendering of `answer` (links flattened).
 */

const home = [
  {
    question: 'Where can I view pieces?',
    schemaQuestion: 'Where can I view pieces in Edmonton?',
    answer:
      'All available pieces are in Edmonton. Viewings are by appointment — no set hours. Text or call 780-965-1477 and we’ll arrange a time.',
  },
  {
    question: 'What brands do you carry?',
    schemaQuestion: 'What brands of used furniture does Edmonton Refreshed carry?',
    answer:
      'We work with well-built pieces from recognized makers: Natuzzi, B&B Italia, La-Z-Boy, Rove Concepts, Brentwood Classics, Crate & Barrel, Urban Barn, EQ3, American Leather, and similar. If it’s a recognized brand in good condition, we’re interested.',
  },
  {
    question: 'Do you deliver?',
    schemaQuestion: 'Do you deliver furniture in Edmonton?',
    answer:
      'Delivery is available at an additional fee determined by distance to your home from our location, and complexity of delivery - are you in an apartment? Or is your desired room located anywhere other than the main floor of your home? This is the main factor determining complexity, but not the only one.',
  },
  {
    question: 'How do I sell my sofa or sectional?',
    schemaQuestion: 'How do I sell my sofa or sectional to Edmonton Refreshed?',
    answer:
      'Head to the [Sell Your Furniture](/sell/) page. Send photos, the brand, and approximate age — we come back with an offer today and handle all pickup. No listings, no back-and-forth.',
    schemaAnswer:
      'Head to the Sell Your Furniture page. Send photos, the brand, age, and your asking price — we get you a fair offer today and handle all pickup.',
  },
];

const sell = [
  {
    question: 'How do you decide how much to pay?',
    answer:
      'Every offer is based on three inputs: brand tier, age, and condition. A recognized brand in excellent condition within the last few years holds a meaningful share of its value. An older piece, or a piece from a mass-market brand, sells for a fraction of original retail regardless of what it cost new. We’ll walk you through the reasoning on any offer we make.',
  },
  {
    question: 'What happens if my piece isn’t a fit?',
    answer:
      'We’ll tell you straight, usually the same day. No runaround. If we can’t buy it, we’ll sometimes point you toward a channel that makes more sense — consignment, marketplace, or donation.',
  },
  {
    question: 'How fast can you pick up?',
    answer:
      'Pickups can often happen within 24 hours of an accepted offer, scheduled around you. We bring the truck and do all the lifting.',
  },
  {
    question: 'Do you pay cash or e-transfer?',
    answer:
      'Both. Cash or e-transfer on the spot — your choice, paid before the piece leaves your home.',
  },
  {
    question: 'What if my brand isn’t listed?',
    answer:
      'The list isn’t exhaustive. If it’s a recognized maker or came from a premium retailer like Signature Lane or Cottswood Interiors, it’s worth sending in. If you’re not sure, send photos and we’ll tell you.',
  },
  {
    question: 'Do you buy anything besides sofas and sectionals?',
    answer:
      'Generally no. We specialize in sofas and sectionals — that’s where our resale channels and pricing are dialed in. Chairs sold as part of a matching set with a sofa are in; standalone chairs, dining sets, and bedroom furniture are out.',
  },
];

const about = [
  {
    question: 'Where can I view pieces?',
    schemaQuestion: 'Where can I view pieces in Edmonton?',
    answer:
      'All available pieces are in Edmonton. Viewings are by appointment — there are no set hours. Text or call 780-965-1477 and we’ll arrange a time that works.',
    schemaAnswer:
      'All available pieces are in Edmonton and viewings are by appointment. There are no set hours — text or call 780-965-1477 and we’ll arrange a time that works.',
  },
  {
    question: 'What brands do you carry?',
    schemaQuestion: 'What brands of used furniture does Edmonton Refreshed carry?',
    answer:
      'We focus on well-built pieces from recognized makers: Natuzzi, B&B Italia, La-Z-Boy, Rove Concepts, Brentwood Classics, Crate & Barrel, Urban Barn, EQ3, American Leather, and similar. If it’s a well-built piece from a known manufacturer, we’re likely interested.',
    schemaAnswer:
      'Edmonton Refreshed works with well-built pieces from recognized makers including Natuzzi, B&B Italia, La-Z-Boy, Rove Concepts, Brentwood Classics, Crate & Barrel, Urban Barn, EQ3, American Leather, and others. The focus is on furniture that holds its quality and value.',
  },
  {
    question: 'Do you deliver?',
    schemaQuestion: 'Do you deliver furniture in Edmonton?',
    answer:
      'Delivery is available at an additional fee determined by distance to your home from our location, and complexity of delivery - are you in an apartment? Or is your desired room located anywhere other than the main floor of your home? This is the main factor determining complexity, but not the only one.',
  },
  {
    question: 'How do I sell my sofa or sectional?',
    schemaQuestion: 'How do I sell my sofa or sectional to Edmonton Refreshed?',
    answer:
      'Text or email photos along with the brand, approximate age, and any condition notes. We get you an offer today. If we proceed, we handle pickup at your convenience and pay cash or e-transfer on the spot. See the [Sell Your Furniture](/sell/) page for details.',
    schemaAnswer:
      'Text or email clear photos along with the brand, approximate age, and any condition notes. We get you a fair offer today. If we proceed, we handle all pickup at your convenience and pay cash or e-transfer on the spot.',
  },
  {
    question: 'What condition does a piece need to be in?',
    schemaQuestion: 'What condition does furniture need to be in?',
    answer:
      'No major damage, significant staining, or structural problems. Normal wear consistent with age is fine — we assess each piece honestly and price it accordingly. We’re transparent about condition in every listing.',
    schemaAnswer:
      'We buy pieces with no major damage, significant staining, or structural issues. Minor wear consistent with normal use is fine — we assess each piece honestly and price accordingly. We’re transparent about condition in every listing.',
  },
  {
    question: 'How do you set prices?',
    schemaQuestion: 'How do you price the furniture you sell?',
    answer:
      'Based on original retail value, brand, age, and current condition. We research comparable listings and price to offer genuine value without overpaying or underpricing. Descriptions include what you’d pay new so you can judge the savings yourself.',
    schemaAnswer:
      'Pricing reflects the piece’s original retail value, brand reputation, age, and current condition. We research comparable sales and aim to price fairly — offering genuine value versus retail while ensuring the quality justifies the price.',
  },
  {
    question: 'Do you serve areas outside Edmonton?',
    answer:
      'Yes. We regularly work with buyers and sellers from St. Albert, Sherwood Park, Spruce Grove, Leduc, and Fort Saskatchewan, as well as all areas of Edmonton.',
    schemaAnswer:
      'We regularly work with buyers and sellers from St. Albert, Sherwood Park, Spruce Grove, Leduc, and Fort Saskatchewan, in addition to all areas of Edmonton.',
  },
];

module.exports = { home, sell, about };

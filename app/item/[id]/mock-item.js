export const sampleItems = [
  {
    id: "itm_001",
    title: "Black Leather Bifold Wallet",
    category: "Bag",
    brand: "Bellroy / Genuine Leather",
    color: "Charcoal Black",
    condition: "Good condition (minor edge wear)",
    description:
      "Found on a study desk on the 2nd floor of the Main Library. Features contrast stitching and multiple card slots. Personal IDs and cards inside have been securely protected.",
    status: "in_custody",
    statusLabel: "In Custody (Security Desk)",
    foundAt: "2026-08-26T16:10:00Z",
    location: {
      building: "Main Library",
      floor: "2nd Floor",
      room: "Quiet Study Area East (Desk #14)",
    },
    holdingLocation: "Main Library Security & Lost Property Desk (Ground Floor)",
    operatingHours: "Mon – Fri: 08:30 AM – 08:00 PM",
    photos: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554415707-9e4426dca2c7?w=800&auto=format&fit=crop&q=80",
    ],
    specifics: {
      "Item Type": "Slim Bifold Wallet",
      "Primary Material": "Full-grain Leather",
      "Color": "Charcoal Black with tan inner lining",
      "Compartments": "6 card slots + cash sleeve",
      "Masked Card Ending": "•••• •••• 4821",
    },
    verificationChallenge: {
      question: "What specific initials, name on cards, or hidden compartment detail is inside?",
      hint: "E.g. Initials stamped on leather, specific student/bank card name, or exact cash denomination.",
      secretKeyword: "P.S.",
      alternativeKeywords: ["ps", "prakhar", "visa", "chase", "4821", "dent", "scratch"],
    },
    proofTypes: ["Photo of Card / ID", "Proof of Purchase / Invoice", "Exact Description of Contents"],
  },
  {
    id: "itm_002",
    title: "Apple AirPods Pro (2nd Gen)",
    category: "Electronics",
    brand: "Apple",
    color: "White in Matte Blue Case",
    condition: "Excellent (clean, working)",
    description:
      "Found on cafeteria table #12 in the Student Center. Housed in a dark blue protective silicone case with a small carabiner clip.",
    status: "in_custody",
    statusLabel: "In Custody (Student Center Info Desk)",
    foundAt: "2026-08-27T13:30:00Z",
    location: {
      building: "Student Center",
      floor: "1st Floor",
      room: "Main Cafeteria (Table #12 near windows)",
    },
    holdingLocation: "Student Center Central Information Desk",
    operatingHours: "Mon – Sat: 08:00 AM – 10:00 PM",
    photos: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&auto=format&fit=crop&q=80",
    ],
    specifics: {
      "Brand & Model": "Apple AirPods Pro (2nd Gen, USB-C)",
      "Case Color": "Navy / Matte Blue Silicone",
      "Features": "Carabiner clip attached",
      "Serial Masked": "••••-H792",
    },
    verificationChallenge: {
      question: "What is your Bluetooth device name, Apple ID email hint, or serial ending?",
      hint: "E.g. 'Alex's AirPods' or matching serial number from your Apple receipt/Find My app.",
      secretKeyword: "Alex",
      alternativeKeywords: ["alex", "h792", "blue case", "carabiner", "find my"],
    },
    proofTypes: ["Screenshot of Apple Find My App", "Purchase Receipt / Box Serial", "Pairing in Person at Desk"],
  },
  {
    id: "itm_003",
    title: "Hydro Flask 32oz Water Bottle",
    category: "Water Bottle",
    brand: "Hydro Flask",
    color: "Pacific Blue",
    condition: "Good (few mountain stickers)",
    description:
      "Found by the bench in the Sports Complex basketball court. Large 32oz insulated bottle with a flex straw lid and mountain travel stickers.",
    status: "in_custody",
    statusLabel: "In Custody (Gym Reception)",
    foundAt: "2026-08-28T18:00:00Z",
    location: {
      building: "Sports Complex",
      floor: "Ground Floor",
      room: "Basketball Court #2 (Side Bench)",
    },
    holdingLocation: "Gym Reception & Lost and Found Locker",
    operatingHours: "Daily: 06:00 AM – 10:00 PM",
    photos: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
    ],
    specifics: {
      "Brand": "Hydro Flask",
      "Capacity": "32 oz / 946 ml Wide Mouth",
      "Color": "Pacific Blue with Black Cap",
      "Stickers / Marks": "Yosemite & National Park Stickers",
    },
    verificationChallenge: {
      question: "Describe at least two specific stickers, scratches, or bottom markings on the bottle.",
      hint: "E.g. Sticker names, colors, or dent location on base.",
      secretKeyword: "Yosemite",
      alternativeKeywords: ["yosemite", "national park", "mountain", "dent", "blue"],
    },
    proofTypes: ["Photo of Bottle with you", "Detailed Sticker Description"],
  },
  {
    id: "itm_004",
    title: "University Student ID & Keycard",
    category: "ID/Card",
    brand: "Campus Card Services",
    color: "White / Navy University Card",
    condition: "Intact in clear cardholder",
    description:
      "Student RFID ID card found near the lecture podium in Engineering Block B. In a clear plastic sleeve on a red lanyard.",
    status: "with_finder",
    statusLabel: "With Finder (Awaiting Claim)",
    foundAt: "2026-08-28T11:15:00Z",
    location: {
      building: "Engineering Block B",
      floor: "2nd Floor",
      room: "Lecture Hall B-204 (Front Podium)",
    },
    holdingLocation: "Finder is on campus (can meet at Engineering Atrium)",
    operatingHours: "Contact via verification pass",
    photos: [
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
    ],
    specifics: {
      "Document Type": "Student ID & Access Keycard",
      "Lanyard": "Red Campus Lanyard",
      "Student Initials": "P. S.",
      "Card Validity": "Valid through 2027",
    },
    verificationChallenge: {
      question: "What is your full student name and Student ID Number matching this card?",
      hint: "Must match the registered student database record.",
      secretKeyword: "Prakhar",
      alternativeKeywords: ["prakhar", "saraswat", "258", "engineering", "ps"],
    },
    proofTypes: ["Student Portal Login", "Matching Government Photo ID"],
  },
];

export const mockItem = sampleItems[0];
export const mockRoles = ["verified_student", "guest", "finder_admin"];

export function getItemById(id) {
  const match = sampleItems.find((item) => item.id === id);
  return match || sampleItems[0];
}

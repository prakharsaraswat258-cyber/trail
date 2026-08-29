const assert = require('node:assert/strict');

const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'it', 'as', 'be', 'are', 'was', 'were', 'been', 'has',
  'have', 'had', 'do', 'does', 'did', 'my', 'your', 'his', 'her', 'its', 'our',
  'their', 'this', 'that', 'these', 'those', 'near', 'left', 'found', 'lost',
  'item', 'some', 'about', 'just', 'over', 'into', 'under', 'here', 'there',
  'when', 'where', 'which', 'who', 'what', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'only', 'same', 'so', 'than', 'too',
  'very', 'can', 'will', 'should', 'would', 'could', 'please',
]);

function tokenize(text, filterStopwords = false) {
  if (!text || typeof text !== 'string') return new Set();
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
  if (!cleaned) return new Set();
  const tokens = cleaned
    .split(/\s+/)
    .filter((w) => Boolean(w) && (!filterStopwords || (w.length > 2 && !STOPWORDS.has(w))));
  return new Set(tokens);
}

function scoreMatch(foundItem, lostReport) {
  if (!foundItem || !lostReport) return 0;

  // 1. Category exact match (25 pts)
  let categoryScore = 0;
  if (
    foundItem.category &&
    lostReport.category &&
    foundItem.category.trim().toLowerCase() === lostReport.category.trim().toLowerCase()
  ) {
    categoryScore = 25;
  }

  // 2. Location matching (20 pts exact building, 10 pts secondary overlap)
  let locationScore = 0;
  const foundBuilding = (foundItem.location_building || foundItem.location?.building || '')
    .trim()
    .toLowerCase();
  const lostBuilding = (lostReport.location_building || '').trim().toLowerCase();

  if (foundBuilding && lostBuilding && foundBuilding === lostBuilding) {
    locationScore = 20;
  } else {
    const foundSecondary = (
      (foundItem.location_floor || foundItem.location?.floor || '') +
      ' ' +
      (foundItem.location_landmark_or_room || foundItem.location?.landmarkOrRoom || '')
    ).trim();
    const lostSecondary = (lostReport.location_area || '').trim();

    if (foundSecondary && lostSecondary) {
      const foundSecTokens = tokenize(foundSecondary);
      const lostSecTokens = tokenize(lostSecondary);
      let overlaps = false;

      foundSecTokens.forEach((token) => {
        if (token.length >= 3 && lostSecTokens.has(token)) {
          overlaps = true;
        }
      });

      if (
        overlaps ||
        foundSecondary.toLowerCase().includes(lostSecondary.toLowerCase()) ||
        lostSecondary.toLowerCase().includes(foundSecondary.toLowerCase())
      ) {
        locationScore = 10;
      }
    }
  }

  // 3. Date proximity (20 pts max, 0 pts if found before lost)
  let dateScore = 0;
  if (foundItem.date_found && lostReport.date_lost) {
    const parseUtcDate = (dStr) => {
      const [y, m, d] = dStr.split('-').map(Number);
      return Date.UTC(y, (m || 1) - 1, d || 1);
    };

    const foundUtc = parseUtcDate(foundItem.date_found);
    const lostUtc = parseUtcDate(lostReport.date_lost);

    if (foundUtc >= lostUtc) {
      const diffDays = Math.max(0, (foundUtc - lostUtc) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        dateScore = 20;
      } else if (diffDays < 14) {
        dateScore = 20 * (1 - diffDays / 14);
      } else {
        dateScore = 0;
      }
    }
  }

  // 4. Text similarity (25 pts scaled by token-overlap ratio of item_name + description)
  const textFound = `${foundItem.item_name || ''} ${foundItem.description || ''}`;
  const textLost = `${lostReport.item_name || ''} ${lostReport.description || ''}`;
  const tokensFound = tokenize(textFound, true);
  const tokensLost = tokenize(textLost, true);

  let overlapRatio = 0;
  if (tokensFound.size > 0 && tokensLost.size > 0) {
    let intersectionCount = 0;
    tokensFound.forEach((t) => {
      if (tokensLost.has(t)) {
        intersectionCount++;
      }
    });
    const unionSet = new Set();
    tokensFound.forEach((t) => unionSet.add(t));
    tokensLost.forEach((t) => unionSet.add(t));
    const unionSize = unionSet.size;
    overlapRatio = unionSize > 0 ? intersectionCount / unionSize : 0;
  }
  const textScore = 25 * overlapRatio;

  // 5. Distinct keyword overlap bonus (10 pts if shared distinctive word len > 3, and overlap ratio < 0.3)
  let keywordBonus = 0;
  if (overlapRatio < 0.3) {
    const descTokensFound = tokenize(foundItem.description, true);
    const descTokensLost = tokenize(lostReport.description, true);

    descTokensFound.forEach((token) => {
      if (token.length > 3 && !STOPWORDS.has(token) && descTokensLost.has(token)) {
        keywordBonus = 10;
      }
    });
  }

  const rawTotal = categoryScore + locationScore + dateScore + textScore + keywordBonus;
  return Math.max(0, Math.min(100, Math.round(rawTotal)));
}

console.log('Testing tokenize...');
const tokens = tokenize('Apple MacBook Pro 16-inch (Space Gray)!');
assert.ok(tokens.has('apple'));
assert.ok(tokens.has('macbook'));
assert.ok(tokens.has('pro'));
assert.ok(tokens.has('16'));
assert.ok(tokens.has('inch'));
assert.ok(tokens.has('space'));
assert.ok(tokens.has('gray'));
console.log('Tokenize test passed.');

console.log('Testing scoreMatch exact match...');
const foundExact = {
  id: 'found-1',
  category: 'Electronics',
  location_building: 'Block 34',
  location_floor: 'Floor 2',
  date_found: '2026-08-29',
  item_name: 'Apple MacBook Pro Charger',
  description: 'White 96W Apple USB-C power adapter and cable left on desk.',
};

const lostExact = {
  id: 'lost-1',
  category: 'Electronics',
  location_building: 'Block 34',
  location_area: 'Room 204, 2nd Floor',
  date_lost: '2026-08-29',
  item_name: 'Apple MacBook Pro Charger',
  description: 'White 96W Apple USB-C power adapter and cable left on desk.',
  status: 'submitted',
};

const scoreExact = scoreMatch(foundExact, lostExact);
console.log('Exact match score:', scoreExact);
assert.ok(scoreExact >= 85, `Expected >= 85, got ${scoreExact}`);

console.log('Testing scoreMatch category mismatch...');
const lostDiffCat = { ...lostExact, category: 'Bag' };
const scoreDiffCat = scoreMatch(foundExact, lostDiffCat);
console.log('Category mismatch score:', scoreDiffCat);
assert.equal(scoreExact - scoreDiffCat, 25);

console.log('Testing location secondary overlap...');
const foundDiffBuilding = {
  ...foundExact,
  location_building: 'Central Library',
  location_floor: 'Floor 3 Study Hall',
};
const lostDiffBuilding = {
  ...lostExact,
  location_building: 'Student Center',
  location_area: 'Study Hall 3rd Floor',
};
const scoreLocSec = scoreMatch(foundDiffBuilding, lostDiffBuilding);
console.log('Secondary location score:', scoreLocSec);
assert.ok(scoreLocSec > 0);

console.log('Testing date proximity decaying...');
const lostOld = { ...lostExact, date_lost: '2026-08-22' }; // 7 days prior
const scoreOld = scoreMatch(foundExact, lostOld);
console.log('7 days apart score:', scoreOld);
assert.ok(scoreExact - scoreOld >= 8 && scoreExact - scoreOld <= 12);

console.log('Testing date found before date lost (0 pts)...');
const lostFuture = { ...lostExact, date_lost: '2026-08-30' }; // 1 day after found
const scoreFuture = scoreMatch(foundExact, lostFuture);
console.log('Found before lost score:', scoreFuture);
assert.equal(scoreExact - scoreFuture, 20);

console.log('Testing distinct keyword bonus for sparse match...');
const foundSparse = {
  category: 'Electronics',
  location_building: 'Block 34',
  date_found: '2026-08-29',
  item_name: 'Earbuds',
  description: 'Found black sennheiser earbuds on chair.',
};
const lostSparse = {
  id: 'lost-sparse',
  category: 'Electronics',
  location_building: 'Block 34',
  date_lost: '2026-08-29',
  item_name: 'Headphones',
  description: 'Lost my wireless sennheiser audio buds while studying.',
};
const scoreSparse = scoreMatch(foundSparse, lostSparse);
console.log('Sparse keyword match score:', scoreSparse);
assert.ok(scoreSparse >= 70, `Expected >= 70, got ${scoreSparse}`);

console.log('Testing completely unrelated item...');
const foundUnrelated = {
  category: 'Clothing',
  location_building: 'Sports Complex',
  date_found: '2026-08-29',
  item_name: 'Blue Jacket',
  description: 'Blue denim jacket with zip.',
};
const lostUnrelated = {
  id: 'lost-unrelated',
  category: 'Electronics',
  location_building: 'Library',
  date_lost: '2026-08-01',
  item_name: 'Laptop Charger',
  description: 'Black HP laptop charger with brick.',
  status: 'submitted',
};
const scoreUnrelated = scoreMatch(foundUnrelated, lostUnrelated);
console.log('Unrelated score:', scoreUnrelated);
assert.equal(scoreUnrelated, 0);

console.log('ALL MATCHING SELF-CHECKS PASSED SUCCESSFULLY!');

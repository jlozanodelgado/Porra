// A simple test script for scoring logic
function calculatePoints(pHome, pAway, aHome, aAway, isPlayoff) {
    let points = 0;
    const mult = isPlayoff ? 2 : 1;
    if (pHome === aHome) points += 1 * mult;
    if (pAway === aAway) points += 1 * mult;
    const predResult = pHome > pAway ? 'HOME' : pHome < pAway ? 'AWAY' : 'DRAW';
    const actualResult = aHome > aAway ? 'HOME' : aHome < aAway ? 'AWAY' : 'DRAW';
    if (predResult === actualResult) points += 1 * mult;
    if (pHome === aHome && pAway === aAway) {
        points += 2 * mult;
    }
    return points;
}

console.log("TEST 1 - Exact Match Group (expected 5):", calculatePoints(2, 1, 2, 1, false) === 5 ? "PASS" : "FAIL");
console.log("TEST 2 - Exact Match Playoff (expected 10):", calculatePoints(2, 1, 2, 1, true) === 10 ? "PASS" : "FAIL");
console.log("TEST 3 - Winner and 1 exact goal Group (expected 2):", calculatePoints(2, 0, 1, 0, false) === 2 ? "PASS" : "FAIL");
console.log("TEST 4 - Total Failure (expected 0):", calculatePoints(0, 3, 2, 0, false) === 0 ? "PASS" : "FAIL");

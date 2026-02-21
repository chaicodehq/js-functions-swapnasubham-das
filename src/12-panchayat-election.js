/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */
export function createElection(candidates = []) {
  const votes = {};
  const registered = new Map();
  const voted = new Set();
  const candidateMap = new Map(candidates.map(c => [c.id, c]));

  return {
    registerVoter(voter) {
      if (
        !voter ||
        !voter.id ||
        typeof voter.age !== "number" ||
        voter.age < 18 ||
        registered.has(voter.id)
      ) {
        return false;
      }

      registered.set(voter.id, voter);
      return true;
    },

    castVote(voterId, candidateId, onSuccess, onError) {
      const fail = (msg) =>
        typeof onError === "function" ? onError(msg) : undefined;

      if (!registered.has(voterId)) return fail("Voter not registered");
      if (!candidateMap.has(candidateId)) return fail("Candidate not found");
      if (voted.has(voterId)) return fail("Already voted");

      voted.add(voterId);
      votes[candidateId] = (votes[candidateId] || 0) + 1;

      return typeof onSuccess === "function"
        ? onSuccess({ voterId, candidateId })
        : undefined;
    },

    getResults(sortFn) {
      const results = candidates.map(c => ({
        id: c.id,
        name: c.name,
        party: c.party,
        votes: votes[c.id] || 0
      }));

      const defaultSort = (a, b) => b.votes - a.votes;

      return [...results].sort(sortFn || defaultSort);
    },

    getWinner() {
      const results = this.getResults();
      if (results.every(r => r.votes === 0)) return null;
      return results[0];
    }
  };
}

export function createVoteValidator(rules = {}) {
  const { minAge = 18, requiredFields = [] } = rules;

  return function (voter) {
    if (!voter) return { valid: false, reason: "Invalid voter" };

    for (const field of requiredFields) {
      if (!(field in voter)) {
        return { valid: false, reason: `${field} missing` };
      }
    }

    if (typeof voter.age !== "number" || voter.age < minAge) {
      return { valid: false, reason: "Age requirement not met" };
    }

    return { valid: true };
  };
}

export function countVotesInRegions(regionTree) {
  if (!regionTree || typeof regionTree.votes !== "number") return 0;

  const sub = Array.isArray(regionTree.subRegions)
    ? regionTree.subRegions.reduce(
        (sum, r) => sum + countVotesInRegions(r),
        0
      )
    : 0;

  return regionTree.votes + sub;
}

export function tallyPure(currentTally = {}, candidateId) {
  return {
    ...currentTally,
    [candidateId]: (currentTally[candidateId] || 0) + 1
  };
}

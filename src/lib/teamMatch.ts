/**
 * Team Finder matching. Every number comes from recorded data, and the formula is shown to the user.
 *
 *   skill coverage   = required skills the candidate has in their Skill Passport / total required
 *   interest signal  = 1 if any of the candidate's interests appears in the project's technologies or category
 *   score            = round(100 * (0.8 * skill coverage + 0.2 * interest signal))
 *
 * Verified skills are reported separately. They do not add to the score, so a self-reported skill
 * is never ranked below a verified one for the same match.
 */

export interface MatchProject {
  requiredSkills: string[];
  technologies: string[];
  category: string;
}

export interface MatchCandidate {
  userId: string;
  name: string;
  branch: string;
  interests: string[];
  skills: { name: string; verified: boolean; proficiency: string; isLearningGoal: boolean }[];
}

export interface MatchResult {
  score: number | null;           // null when the project lists no required skills
  matchedSkills: string[];
  missingSkills: string[];
  verifiedMatchedSkills: string[];
  sharedInterests: string[];
  explanation: string;
}

const norm = (s: string) => s.trim().toLowerCase();

export function computeMatch(project: MatchProject, candidate: MatchCandidate): MatchResult {
  // Fall back to technologies when no explicit required skills are set.
  const required = [...new Set((project.requiredSkills.length ? project.requiredSkills : project.technologies).map(norm))]
    .filter(Boolean);

  // Only real Skill Passport entries count; learning goals are not skills the candidate has.
  const owned = candidate.skills.filter((s) => !s.isLearningGoal);
  const ownedNames = new Map(owned.map((s) => [norm(s.name), s]));

  if (required.length === 0) {
    return {
      score: null, matchedSkills: [], missingSkills: [], verifiedMatchedSkills: [], sharedInterests: [],
      explanation: 'This project has no required skills listed, so no match score can be calculated.',
    };
  }

  const matched = required.filter((r) => ownedNames.has(r));
  const missing = required.filter((r) => !ownedNames.has(r));
  const verifiedMatched = matched.filter((r) => ownedNames.get(r)?.verified);

  const projectTerms = new Set([...project.technologies, project.category].map(norm));
  const sharedInterests = candidate.interests.filter((i) => projectTerms.has(norm(i)));
  const interestSignal = sharedInterests.length > 0 ? 1 : 0;

  const coverage = matched.length / required.length;
  const score = Math.round(100 * (0.8 * coverage + 0.2 * interestSignal));

  const parts = [
    `Has ${matched.length} of ${required.length} required skills`,
    sharedInterests.length ? `shares interest in ${sharedInterests.join(', ')}` : 'no shared interests with this project',
  ];
  return {
    score,
    matchedSkills: matched,
    missingSkills: missing,
    verifiedMatchedSkills: verifiedMatched,
    sharedInterests,
    explanation: parts.join('; ') + '.',
  };
}

import { describe, it, expect } from 'vitest';
import { computeMatch, type MatchCandidate, type MatchProject } from '../lib/teamMatch';

const project: MatchProject = {
  requiredSkills: ['React', 'Node.js', 'SQL'],
  technologies: ['React', 'Node.js', 'PostgreSQL'],
  category: 'Web Development',
};

const candidate = (over: Partial<MatchCandidate> = {}): MatchCandidate => ({
  userId: 'u1', name: 'A', branch: 'CSE', interests: [],
  skills: [], ...over,
});

describe('computeMatch', () => {
  it('scores full skill coverage at 80 and adds 20 for a shared interest', () => {
    const c = candidate({
      interests: ['Web Development'],
      skills: [
        { name: 'react', verified: false, proficiency: 'Advanced', isLearningGoal: false },
        { name: 'node.js', verified: true, proficiency: 'Intermediate', isLearningGoal: false },
        { name: 'SQL', verified: false, proficiency: 'Beginner', isLearningGoal: false },
      ],
    });
    const r = computeMatch(project, c);
    expect(r.score).toBe(100);
    expect(r.matchedSkills).toEqual(['react', 'node.js', 'sql']);
    expect(r.missingSkills).toEqual([]);
    expect(r.verifiedMatchedSkills).toEqual(['node.js']);
  });

  it('reports missing skills and gives partial coverage', () => {
    const c = candidate({ skills: [{ name: 'React', verified: false, proficiency: 'Beginner', isLearningGoal: false }] });
    const r = computeMatch(project, c);
    expect(r.score).toBe(Math.round(100 * 0.8 * (1 / 3)));
    expect(r.missingSkills).toEqual(['node.js', 'sql']);
  });

  it('does not count learning goals as skills the candidate has', () => {
    const c = candidate({ skills: [{ name: 'SQL', verified: false, proficiency: 'Beginner', isLearningGoal: true }] });
    const r = computeMatch(project, c);
    expect(r.matchedSkills).toEqual([]);
    expect(r.score).toBe(0);
  });

  it('returns no score when the project lists no skills or technologies', () => {
    const r = computeMatch({ requiredSkills: [], technologies: [], category: 'Other' }, candidate());
    expect(r.score).toBeNull();
    expect(r.explanation).toMatch(/no required skills/);
  });

  it('never gives a verified skill a higher score than the same self-reported skill', () => {
    const verified = candidate({ skills: [{ name: 'React', verified: true, proficiency: 'Advanced', isLearningGoal: false }] });
    const selfReported = candidate({ skills: [{ name: 'React', verified: false, proficiency: 'Advanced', isLearningGoal: false }] });
    expect(computeMatch(project, verified).score).toBe(computeMatch(project, selfReported).score);
  });

  it('explains the score in plain words', () => {
    const r = computeMatch(project, candidate({ skills: [{ name: 'React', verified: false, proficiency: 'Beginner', isLearningGoal: false }] }));
    expect(r.explanation).toMatch(/Has 1 of 3 required skills/);
  });
});

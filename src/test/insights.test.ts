import { describe, it, expect } from 'vitest';
import { isSkillInsights } from '../lib/insights';

const good = {
  skillsDemonstrated: [{ skill: 'React', evidence: 'Used in Campus Ride Share' }],
  learnNext: [{ skill: 'Testing', why: 'No test tools appear in your projects' }],
  portfolioTips: ['Add a demo link to your project'],
  roleIdeas: [{ role: 'Frontend lead', why: 'React and project ownership' }],
  disclaimer: 'Suggestions only.',
};

describe('isSkillInsights', () => {
  it('accepts the expected shape', () => {
    expect(isSkillInsights(good)).toBe(true);
  });
  it('rejects missing sections and wrong types', () => {
    expect(isSkillInsights({ ...good, learnNext: 'Docker' })).toBe(false);
    expect(isSkillInsights({ ...good, portfolioTips: [42] })).toBe(false);
    expect(isSkillInsights(null)).toBe(false);
  });
  it('rejects oversized lists and text', () => {
    expect(isSkillInsights({ ...good, portfolioTips: Array(9).fill('tip') })).toBe(false);
    expect(isSkillInsights({ ...good, portfolioTips: ['x'.repeat(401)] })).toBe(false);
  });
});

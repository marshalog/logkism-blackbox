// Central deploy config for BLACKBOX blog
export const GITHUB_USER = 'marshalog';
export const REPO = 'logkism-blackbox';
export const PORTFOLIO_REPO = 'logkism-portfolio';

const isProd = process.argv.includes('build') || process.env.CI === 'true';

export const SITE = `https://${GITHUB_USER}.github.io`;
export const BASE = isProd ? `/${REPO}/` : '/';

// Where portfolio lives (dev: portfolio on :4321)
export const PORTFOLIO_URL =
  process.env.PORTFOLIO_URL || (isProd ? `${SITE}/${PORTFOLIO_REPO}/` : 'http://localhost:4321/');

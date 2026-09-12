const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to reside inside the server directory
  // so that it persists across Render's build and runtime steps.
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};

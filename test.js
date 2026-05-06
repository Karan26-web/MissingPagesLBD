const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const BRAVE_PATH = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const EBOOK_PATH = `file://${path.resolve(__dirname, 'ebook.html')}`;

if (!fs.existsSync(BRAVE_PATH)) {
  console.error('Brave browser not found at:', BRAVE_PATH);
  process.exit(1);
}

async function launch(headless = false) {
  return puppeteer.launch({
    executablePath: BRAVE_PATH,
    headless,
    args: ['--no-sandbox', '--disable-web-security', '--allow-file-access-from-files'],
  });
}

async function run() {
  const browser = await launch(false);
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log('Opening ebook.html in Brave...');
  await page.goto(EBOOK_PATH, { waitUntil: 'networkidle0' });

  console.log('Page title:', await page.title());
  console.log('Browser is open. Press Ctrl+C to close.');

  // Keep alive
  await new Promise(() => {});
}

run().catch(console.error);

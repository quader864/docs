const puppeteer = require('puppeteer');
const Sentiment = require("../models/Sentiment");
const { parseSentimentHTML } = require("../utils/helpers");

async function fetchAndSaveSentiment() {
  let browser;
  let retries = 0;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      console.log(`🚀 Puppeteer start (Attempt ${retries + 1}/${maxRetries})`);

      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--mute-audio',
          '--window-size=1024,768'
        ]
      });

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(180000);
      page.setDefaultTimeout(120000);

      await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36');

      console.log('🌐 Navigating to FXBlue...');
      await page.goto('https://www.fxblue.com/market-data/tools/sentiment', {
        waitUntil: 'networkidle2',
        timeout: 180000
      });

      await page.waitForFunction(() => {
        const el = document.querySelector('#SentimentContainer');
        return el && el.innerHTML.trim().length > 0;
      }, { timeout: 30000 });

      const containerHTML = await page.$eval('#SentimentContainer', el => el.innerHTML);

      const parsed = parseSentimentHTML(containerHTML);

      if (parsed.length > 0) {
        await Sentiment.insertMany(parsed);
        console.log(`✅ Saved ${parsed.length} sentiment records`);
      } else {
        console.warn('⚠️ No sentiment data found.');
      }

      return true;

    } catch (err) {
      console.error(`❌ Error (Attempt ${retries + 1}):`, err.message);
      retries++;

      if (retries < maxRetries) {
        const delay = 15000 * retries;
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch (closeErr) {
          console.error("⚠️ Browser failed to close:", closeErr.message);
        }
      }
    }
  }

  return false;
}

let isRunning = false;

async function wrapper() {
  if (isRunning) {
    console.log("⏳ Skipping — previous task still running");
    return;
  }
  isRunning = true;

  try {
    await fetchAndSaveSentiment();
  } finally {
    isRunning = false;
  }
}

const initializeService = () => {
  fetchAndSaveSentiment(); 
  setInterval(wrapper, 1000 * 60);
};

module.exports = {
  initializeService,
  fetchAndSaveSentiment,
  wrapper
};
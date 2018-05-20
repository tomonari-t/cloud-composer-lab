const pappeteer = require('puppeteer');
const moment = require('moment');
const GitHubPage = require('./GithubPage');
const BigQueryService = require('./BiqQueryService');

const PROJECT_ID = 'gas-webscraper';
const DATASET_NAME = 'github_trending';
const TABLE_PREFIX = 'daily_';

const main = async () => {
  const browser = await pappeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });
  const page = await browser.newPage();
  const githubPage = new GitHubPage(page);
  await githubPage.gotoTrendPage();
  const firstTrend = await githubPage.getTrendingInfo(1);
  const secondTrend = await githubPage.getTrendingInfo(2);
  const thirdTrend = await githubPage.getTrendingInfo(3);
  await browser.close();

  const tableName = TABLE_PREFIX + moment().format('YYYYMMDD');
  const biqquery = new BigQueryService(PROJECT_ID, DATASET_NAME, tableName);

  await biqquery.insertGitHubTrendData(firstTrend.link, firstTrend.description, firstTrend.starNum, firstTrend.forkedNum, firstTrend.lang);
  await biqquery.insertGitHubTrendData(secondTrend.link, secondTrend.description, secondTrend.starNum, secondTrend.forkedNum, secondTrend.lang);
  await biqquery.insertGitHubTrendData(thirdTrend.link, thirdTrend.description, thirdTrend.starNum, thirdTrend.forkedNum, thirdTrend.lang);
};

(async () => {
  try {
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1)
  }
})();

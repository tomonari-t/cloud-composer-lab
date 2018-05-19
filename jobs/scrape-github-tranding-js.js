const pappeteer = require('puppeteer');

class GithubRepositoryInfo {
  constructor(
    link,
    description,
    starNum,
    forkedNum,
    lang
  ) {
    const authorAndName = link.split('/').slice(-2);
    this.author = authorAndName[0];
    this.repositoryName = authorAndName[1];
    this.link = link;
    this.description = description;
    this.starNum = starNum;
    this.forkedNum = forkedNum;
    this.lang = lang;
  }
}

const main = async () => {
  const URL = 'https://github.com/explore?since=daily&trending=repositories#trending';
  const browser = await pappeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto(URL);
  const trendingElements = await page.$$('.border-bottom.border-gray-light.py-4');
  const trendingInfoList = [];
  for (let i = 0; i < 3; i++) {
    const element = trendingElements[i];
    const link = await element.$eval('h3 a', (node) => node.href);
    const description = await element.$eval('.text-gray.mb-2', (node) => node.innerText);
    const starForkedElement = await element.$$('.d-inline-block.link-gray.mr-4');
    const starNum = await (await starForkedElement[0].getProperty('innerText')).jsonValue();
    const forkedNum = await (await starForkedElement[1].getProperty('innerText')).jsonValue();
    const isExist = await element.$('.d-inline-block.text-gray');
    let lang = undefined;
    if (isExist) {
      lang = await element.$eval('.d-inline-block.text-gray > span:nth-child(2)', (node) => node.innerText);
    }
    trendingInfoList.push(new GithubRepositoryInfo(
      link,
      description,
      starNum,
      forkedNum,
      lang
    ));
  }

  console.log(trendingInfoList);
  await browser.close();
};

main();

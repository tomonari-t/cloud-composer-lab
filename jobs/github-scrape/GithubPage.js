class GithubPage {
  constructor(page) {
    this.page = page;
  }

  async gotoTrendPage() {
    const URL = 'https://github.com/explore?since=daily&trending=repositories#trending';
    await this.page.goto(URL);
  }

  async getTrendingInfo(rank) {
    const trendingElements = await this.page.$$('.border-bottom.border-gray-light.py-4');
    const trendingInfoList = [];
    const element = trendingElements[rank - 1];
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

    return {
      link,
      description,
      starNum: parseInt(starNum, 10),
      forkedNum: parseInt(forkedNum, 10),
      lang: lang || ''
    };
  }
}

module.exports = GithubPage;

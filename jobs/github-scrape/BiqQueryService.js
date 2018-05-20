const BigQuery = require('@google-cloud/bigquery');
class BigQueryService {
  constructor(projectId, datasetName, tableName) {
    this.client = new BigQuery({
      projectId
    });
    this.dataset = this.client.dataset(datasetName);
    this.table = this.dataset.table(tableName);
  }

  async insertGitHubTrendData(link, description, starNum, forkedNum, lang) {
    // 日付テーブルなかったら
    const authorAndName = link.split('/').slice(-2);
    const author = authorAndName[0];
    const repositoryName = authorAndName[1];
    try {
        await this.table.insert([{
          author,
          repositoryName,
          link,
          description,
          starNum,
          forkedNum,
          lang
        }]);
    } catch (e) {
      if (e.name === 'PartialFailureError') {
        if (e.errors && e.errors.length > 0) {
          e.errors.forEach(e => console.log(e));
          throw new Error(`insert error`);
        }
      } else {
        throw new Error(`Error: ${e}`)
      }
    }
  }
}

module.exports = BigQueryService;

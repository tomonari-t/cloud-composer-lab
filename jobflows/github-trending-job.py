import datetime
import os

from slackclient import SlackClient
from airflow import models
from airflow.operators import BashOperator
from airflow.operators import SlackAPIPostOperator
from airflow.utils import trigger_rule

yesterday = datetime.datetime.combine(
  datetime.datetime.today() - datetime.timedelta(1),
  datetime.datetime.min.time()
)

default_dag_args = {
    'start_date': yesterday,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': datetime.timedelta(minutes=1),
    'project_id': models.Variable.get('gcp_project')
}

with models.DAG(
    'github-trending-job',
    schedule_interval=datetime.timedelta(days=1),
    default_args=default_dag_args
    ) as dag:


    get_k8s_credinald = 'gcloud container clusters get-credentials us-central1-github-survey-j-73721e60-gke --zone us-central1-f --project gas-webscraper'
    image_url = models.Variable.get('github_image_url')
    run_container = 'kubectl run puppeter --image={} --rm --attach=true --command -- npm start'.format(image_url)
    collect_data = BashOperator(
        task_id='get_data_github',
        execution_timeout=datetime.timedelta(minutes=10),
        bash_command='{} && {}'.format(get_k8s_credinald, run_container),
        dag=dag,
    )

    success_task = SlackAPIPostOperator(
        task_id='notify_skack',
        username='airflow',
        token='xoxp-16701812533-48173599442-292225017239-0a6dd5ab5e617bd1adc37e4db93c85e3',
        channel='#lab',
        text='hello done',
        dag=dag
    )

    collect_data >> success_task


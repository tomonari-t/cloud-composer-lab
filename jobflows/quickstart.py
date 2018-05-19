import datetime
import os

from airflow import models
from airflow.contrib.operators import dataproc_operator
from airflow.utils import trigger_rule

output_file = os.path.join(
  models.Variable.get('gcs_bucket'),
  'wordcount',
  datetime.datetime.now().strftime('%Y%m%d-%H%M%S')) + os.sep

WORDCOUNT_JAR = (
    'file:///usr/lib/hadoop-mapreduce/hadoop-mapreduce-examples.jar'
)

wordcount_args = ['wordcount', 'gs://pub/shakespeare/rose.txt', output_file]

yesterday = datetime.datetime.combine(
  datetime.datetime.today() - datetime.timedelta(1),
  datetime.datetime.min.time()
)

default_dag_args = {
    # Setting start date as yesterday starts the DAG immediately when it is
    # detected in the Cloud Storage bucket.
    'start_date': yesterday,
    # To email on failure or retry set 'email' arg to your email and enable
    # emailing here.
    'email_on_failure': False,
    'email_on_retry': False,
    # If a task fails, retry it once after waiting at least 5 minutes
    'retries': 1,
    'retry_delay': datetime.timedelta(minutes=5),
    'project_id': models.Variable.get('gcp_project')
}

with models.DAG(
    'quickstart',
    schedule_interval=datetime.timedelta(days=1),
    default_args=default_dag_args
  ) as dag:

  create_dataproc_cluster = dataproc_operator.DataprocClusterCreateOperator(
    task_id='create_dataproc_cluster',
    # Give the cluster a unique name by appending the date scheduled.
    # See https://airflow.apache.org/code.html#default-variables
    cluster_name='quickstart-cluster-{{ ds_nodash }}',
    num_workers=2,
    zone=models.Variable.get('gce_zone'),
    master_machine_type='n1-standard-1',
    worker_machine_type='n1-standard-1'
  )

  # Run the Hadoop wordcount example installed on the Cloud Dataproc cluster
  # master node.
  run_dataproc_hadoop = dataproc_operator.DataProcHadoopOperator(
      task_id='run_dataproc_hadoop',
      main_jar=WORDCOUNT_JAR,
      cluster_name='quickstart-cluster-{{ ds_nodash }}',
      arguments=wordcount_args
  )

  # Delete Cloud Dataproc cluster.
  delete_dataproc_cluster = dataproc_operator.DataprocClusterDeleteOperator(
      task_id='delete_dataproc_cluster',
      cluster_name='quickstart-cluster-{{ ds_nodash }}',
      # Setting trigger_rule to ALL_DONE causes the cluster to be deleted
      # even if the Dataproc job fails.
      trigger_rule=trigger_rule.TriggerRule.ALL_DONE)

  create_dataproc_cluster >> run_dataproc_hadoop >> delete_dataproc_cluster


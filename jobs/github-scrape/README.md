# setup

## docker

`% gcloud docker` is deprecated!!

Do below command and use `% docker`

`% gcloud auth configure-docker`

## gcloud

location

```sh
% gcloud config set composer/location [location]
```

## set env variable in airflow cluster

```sh
% gcloud beta composer environments run [composer env name] variables -- --set [key] [val]
```

- imageurl
- projectid
- airflow cluster zone
- airflow cluster cluster name

## upload dags to remote

```sh
% gcloud beta composer environments storage dags import --environment [env name] --source [to/dags/path]
```

## get credinals that airflow cluster to enable kubctl

```sh
% gcloud container clusters get-credentials [airflow cluster] --zone [airflow cluster zone]
```

# Run once and rm

```sh
% kubectl run puppeter --image=us.gcr.io/to/image --rm --attach=true --command -- npm start
```
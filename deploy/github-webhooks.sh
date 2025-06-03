#!/bin/bash
set -e

cd /home/pm2/github-webhooks || exit 1
git pull origin master
pm2 restart all

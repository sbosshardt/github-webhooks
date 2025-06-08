#!/bin/bash
set -e

cd /home/pm2/webhook-listener || exit 1
git fetch
git pull origin master

sudo /bin/systemctl restart webhook-listener
# You should set up this user to run the above command without a password. i.e.
# sudo visudo
# pm2 ALL=(ALL) NOPASSWD: /bin/systemctl restart webhook-listener

#!/bin/bash
set -e

cd /var/www/evmgastracker.com || exit 1

export NODE_ENV=development
npm install

export NODE_ENV=production
npm run build

pm2 restart all

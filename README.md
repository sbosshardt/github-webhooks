# GitHub Webhook Auto-Deploy Listener

A lightweight Node.js Express server that listens for GitHub Webhook `push` events and automatically pulls, builds, and restarts your app on your production server.

## Features

- Secure webhook verification using HMAC and a shared secret
- Executes `git pull`, `npm install`, `npm run build`, and `pm2 restart`
- Easy to set up behind Nginx or Apache reverse proxy
- Zero dependencies beyond core Node.js and Express stack

## Requirements

- Node.js ≥ 14
- GitHub repository (public or private)
- Your app must be using `pm2` to manage processes

## Setup

1. Install dependencies:

```bash
npm install

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Samuel Bosshardt ([@sbosshardt](https://github.com/sbosshardt))
With assistance from GPT 4o
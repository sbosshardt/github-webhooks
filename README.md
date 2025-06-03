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
```

2. Go to your repository's settings in Github and go to "Webhooks".

3. Set up a webhook with content-type `application/json` that is triggered by "Just the `push` event".

## 📡 Running as a Systemd Service
Create the unit file:

```bash
sudo cp webhook-listener.service.example /etc/systemd/system/webhook-listener.service
```

Use a text editor to configure:
```bash
nano /etc/systemd/system/webhook-listener.service
```

### Key Notes:

1. `User=pm2` — Replace with the correct user that owns the repo.

2. `WorkingDirectory` and `ExecStart` — must point to your actual script directory and file.

3. Make sure Node.js is installed at `/usr/bin/node` (check with `which node`).


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Samuel Bosshardt ([@sbosshardt](https://github.com/sbosshardt)).
With assistance from GPT 4o.
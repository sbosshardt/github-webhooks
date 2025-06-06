# GitHub Webhook Auto-Deploy Listener

A lightweight Node.js Express server that listens for GitHub Webhook `push` events and automatically pulls, builds, and restarts your app on your production server.

## Features

- Secure webhook verification using HMAC and a shared secret
- Executes `git pull`, `npm install`, `npm run build`, and `pm2 restart`
- Easy to set up behind Nginx or Apache reverse proxy
- Zero dependencies beyond core Node.js and Express stack

## Requirements

- Node.js ≥ 20 (Consider using [Nodesource](https://github.com/nodesource/distributions) to install Node systemwide, and remove old version if not needed.)
- GitHub repository (public or private)
- Your app must be using `pm2` to manage processes

## Setup

1. Install dependencies:

```bash
npm install
```

2. Customize your config by making a copy of config.json.example (`cp config.json.example config.json`) and editing it (e.g. `nano config.json`).

3. Go to your repository's settings (e.g. in Github) and go to "Webhooks".

4. Set up a webhook with content-type `application/json` that is triggered by the `push` event.

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
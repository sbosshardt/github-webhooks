const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');
const app = express();

// Get the secret from the environment variable
// You can create a .env file and add the secret there
// or you can set the secret in the environment variables
// on your server.
// e.g. GITHUB_WEBHOOK_SECRET="your-secret-here"
const secret = process.env.GITHUB_WEBHOOK_SECRET;

app.use(bodyParser.json({ verify: verifyGitHubSignature }));

function verifyGitHubSignature(req, res, buf, encoding) {
  console.log('Verifying GitHub signature...');
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) {
    console.log('No signature found');
    return;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(buf);

  const expected = 'sha256=' + hmac.digest('hex');
  if (signature !== expected) {
    throw new Error('Invalid signature');
  }
}

app.post('/github-webhook/deploy/evmgastracker.com', (req, res) => {
  const branch = req.body.ref;
  if (branch === 'refs/heads/master') {
    console.log('Push to master detected for evmgastracker.com repository. Deploying...');

    exec(`
      cd /var/www/evmgastracker.com &&
      git pull origin master &&
      npm install &&
      npm run build &&
      pm2 restart all
    `, (err, stdout, stderr) => {
      if (err) {
        console.error(`Deploy failed: ${stderr}`);
        return res.status(500).send('Deploy error');
      }
      console.log(`Deploy output:\n${stdout}`);
      res.send('Deployed!');
    });
  } else {
    res.send('Not master branch');
  }
});

app.post('/github-webhook/deploy/github-webhooks', (req, res) => {
  const branch = req.body.ref;
  if (branch === 'refs/heads/master') {
    console.log('Push to master detected for github-webhooks repository. Deploying...');

    exec(`
      cd /home/pm2/github-webhooks &&
      git pull origin master &&
      pm2 restart all
    `, (err, stdout, stderr) => {
      if (err) {
        console.error(`Deploy failed: ${stderr}`);
        return res.status(500).send('Deploy error');
      }
      console.log(`Deploy output:\n${stdout}`);
      res.send('Deployed!');
    });
  } else {
    res.send('Not master branch');
  }
});

app.listen(4000, () => {
  console.log('Webhook listener on port 4000 supports');
  console.log('POST /github-webhook/deploy/evmgastracker.com');
  console.log('POST /github-webhook/deploy/github-webhooks');
  console.log()
});

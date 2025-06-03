const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const secret = process.env.GITHUB_WEBHOOK_SECRET;
const port = process.env.LISTEN_PORT || 4000;

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8')
);

app.use(bodyParser.json({ verify: verifyGitHubSignature }));

function verifyGitHubSignature(req, res, buf) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature || !secret) {
    console.error('Missing signature or secret');
    return;
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(buf);
  const expected = `sha256=${hmac.digest('hex')}`;

  if (signature !== expected) {
    throw new Error('Invalid signature');
  }
}

app.post('/github-webhook/deploy/:project', (req, res) => {
  const projectName = req.params.project;
  const project = config.projects[projectName];

  if (!project) {
    return res.status(404).send('Project not found');
  }

  const branch = req.body.ref;
  if (branch !== `refs/heads/${project.branch}`) {
    return res.status(200).send(`Not ${project.branch} branch`);
  }

  console.log(`Push to ${project.branch} detected for ${projectName}. Deploying...`);

  const scriptPath = path.join(__dirname, project.deployScript);
  exec(scriptPath, (err, stdout, stderr) => {
    if (err) {
      console.error(`Deploy failed for ${projectName}:\n${stderr}`);
      return res.status(500).send('Deploy failed');
    }

    console.log(`Deploy output for ${projectName}:\n${stdout}`);
    res.send('Deployed!');
  });
});

app.listen(port, () => {
  console.log('Webhook server running on port '+port+'.');
  Object.keys(config.projects).forEach(name => {
    console.log(`Listening for POST /github-webhook/deploy/${name}`);
  });
});

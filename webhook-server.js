const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const secret = process.env.WEBHOOK_SECRET;
const port = process.env.LISTEN_PORT || 4000;

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8')
);

app.use(bodyParser.json({ verify: verifySignature }));

function verifySignature(req, res, buf) {
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

app.post('/webhook/deploy/:project', (req, res) => {
  const projectName = req.params.project;
  const project = config.projects[projectName];

  if (!project) {
    return res.status(404).send('Project not found');
  }

  const branch = req.body.ref;
  if (branch !== `refs/heads/${project.branch}`) {
    return res.status(200).send(`Not ${project.branch} branch. No action taken.`);
  }

  console.log(`Push to ${project.branch} detected for ${projectName}. Initiating deployment process...`);

  // Send an immediate success response to caller to prevent timeout
  res.status(202).send('Accepted: Deployment process initiated.');

  const scriptPath = path.join(__dirname, project.deployScript);
  exec(scriptPath, (err, stdout, stderr) => {
    if (err) {
      console.error(`Deploy script execution failed for ${projectName}:`);
      console.error(`Error: ${err.message}`);
      if (stdout) {
        console.error(`Stdout:
${stdout}`);
      }
      if (stderr) {
        console.error(`Stderr:
${stderr}`);
      }
      // Cannot send HTTP response here as it's already been sent.
      // Consider implementing more robust error reporting if needed (e.g., logging to a file, sending a notification).
      return;
    }

    console.log(`Deploy script executed successfully for ${projectName}:`);
    if (stdout) {
      console.log(`Stdout:
${stdout}`);
    }
    if (stderr) {
      // Some scripts might output to stderr for informational purposes even on success
      console.warn(`Stderr (check if this is expected):
${stderr}`);
    }
  });
});

app.listen(port, () => {
  console.log('Webhook server running on port '+port+'.');
  Object.keys(config.projects).forEach(name => {
    console.log(`Listening for POST /webhook/deploy/${name}`);
  });
});

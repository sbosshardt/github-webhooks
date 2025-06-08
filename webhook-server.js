const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const configData = fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8');
console.log('configData:', configData);
const config = JSON.parse(configData);
console.log('config:', config);
const port = config.port;
// Use raw body parser to get access to raw request body for signature verification
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

function verifySignature(projectName, rawBody, signature, secret) {
  if (!signature || !secret) {
    throw new Error(`Missing signature or secret for project "${projectName}".`);
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expected = `sha256=${hmac.digest('hex')}`;

  if (signature !== expected) {
    throw new Error('Invalid signature');
  }
}

app.post('/webhook/deploy/:project', (req, res) => {
  const projectName = req.params.project;
  const project = config.projects[projectName];

  if (!project) {
    const status_text = 'Project "'+projectName+'" not found';
    return res.status(404).send(status_text);
  }

  // Verify signature
  try {
    const signature = req.headers['x-hub-signature-256'];
    verifySignature(projectName, req.rawBody, signature, project.webhookSecret);
  } catch (error) {
    console.error(`Signature verification failed for project "${projectName}":`, error.message);
    return res.status(401).send('Invalid signature');
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

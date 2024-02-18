// Q1 - Simple Hello World Server
const express = require('express');
const app1 = express(); // Renommer l'instance d'Express
const port1 = 3001; // Vous pouvez changer le port selon vos besoins

app1.get('/', (req, res) => {
  res.send('Hello, world!');
});

app1.listen(port1, () => {
  console.log(`Server is running on http://localhost:${port1}`);
});


// Q2 - DNS Registry Express Server
const express2 = require('express'); // Renommer le module Express
const app2 = express2(); // Renommer l'instance d'Express
const port2 = 3002; // Vous pouvez changer le port selon vos besoins

// Stocker l'URL du serveur
const serverUrl = `http://localhost:${port2}`;

// Route pour obtenir l'URL du serveur
app2.get('/getServer', (req, res) => {
  res.json({ code: 200, server: serverUrl });
});

app2.listen(port2, () => {
  console.log(`DNS Registry Server is running on http://localhost:${port2}`);
});



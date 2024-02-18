const express = require('express');
const axios = require('axios');
const app = express();
const port = 4000;

const modelEndpoints = {
  Maxime: 'https://8414-78-243-3-16.ngrok-free.app/',
  Adrien: 'https://d70c-2a01-cb08-1083-e400-b8b3-f8ca-e65d-d86.ngrok-free.app/',
  Valentin: 'https://58ca-91-175-131-72.ngrok-free.app/',
  Giacomo: 'https://e327-78-243-3-16.ngrok-free.app/'
};

// Assign weights to models based on their accuracy (you need to adjust these weights based on your actual performance metrics)
const modelWeights = {
  Maxime: 0.7,
  Adrien: 0.8,
  Valentin: 0.2,
};

app.use(express.json());

app.get('/aggregate-predict', async (req, res) => {
  try {
    const predictions = [];
    for (const [name, url] of Object.entries(modelEndpoints)) {
      try {
        const response = await axios.get(url + "predict", { params: req.query });
        predictions.push({ name, prediction: response.data.data.class_probabilities });
      } catch (error) {
        console.log(`Error fetching prediction from ${name} model: ${error.message}`);
      }
    }

    const classSums = { setosa: 0, versicolor: 0, virginica: 0 };
    const classCounts = { setosa: 0, versicolor: 0, virginica: 0 };

    predictions.forEach(({ name, prediction }) => {
      const weight = modelWeights[name];
      Object.keys(prediction).forEach(className => {
        classSums[className] += weight * prediction[className];
        classCounts[className] += weight;
      });
    });

    const classMeans = {};
    Object.keys(classSums).forEach(className => {
      classMeans[className] = classSums[className] / classCounts[className];
    });

    res.json({
      status: 'success',
      predictions,
      mean: classMeans
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'There was a problem collecting predictions from the models',
      error: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Aggregator service is running on http://localhost:${port}`);
});

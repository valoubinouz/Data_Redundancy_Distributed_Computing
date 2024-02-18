## Project Overview

This project involves building an API aggregator service that collects predictions from multiple machine learning models and computes aggregated predictions and means across these predictions. The model is used in this project is a logistic regression model for predicting iris species based on sepal and petal measurements and there is the name of each model used in the json response.


## Components

* Aggregator Service (aggreg.js): This component is responsible for aggregating predictions from multiple models and calculating mean probabilities for each class across all predictions. It uses Axios to make HTTP requests to model endpoints, aggregates predictions, and computes mean probabilities.

* Model Service (app.js): This component serves as the API endpoint for making predictions using a logistic regression model in my case. It receives input parameters (sepal and petal measurements) via HTTP GET requests, invokes the logistic regression model to make predictions, and returns the prediction results in JSON format.

* Logistic Regression Model (predict.py): This Python script contains code for loading the Iris dataset, training a logistic regression model, and making predictions based on input parameters. It uses scikit-learn for model training and prediction.


## How to Run

- Clone the repository to your local machine.
- Navigate to the project directory.
- Install dependencies by running `npm install`.
- Start the Aggregator Service by running `node aggreg.js`.
- Start the Model Service by running `node app.js`.
- Make predictions by sending HTTP GET requests to http://localhost:3000/predict with query parameters for sepal and petal measurements.
- Access aggregated predictions and mean probabilities by sending HTTP GET requests to http://localhost:4000/aggregate-predict.


## Dependencies

- Express.js: Web application framework for Node.js used for building the API.
- Axios: Promise-based HTTP client for making requests to model endpoints.
- scikit-learn: Python library for machine learning, used for logistic regression model training and prediction.


## File Structure

```
project/
│
├── aggreg.js
├── app.js
├── predict.py
│
├── node_modules/
│
├── package.json
└── README.md
```


## Additional Notes

* Ensure that all necessary dependencies are installed and configured before running the services.
* Monitor the console output for any errors or log messages while running the services.
* Make sure that model endpoints are accessible and responding correctly to HTTP requests.


## Contributors

* [Maxime](https://github.com/Achitaka2000/Workshop3?tab=readme-ov-file)
* [Adrien](https://github.com/Ariboux/Workshop3)
* [Giacomo](https://github.com/giaco944/Workshop3?tab=readme-ov-file)


## Advancement
Firstly we had this result :
![image](https://github.com/Ariboux/Workshop3/assets/95749329/7ca87172-d6f0-4606-814e-2fccf558b9c5)

Then, we have weighted the average and arbitrarily chosen these weights:
```javascript
const modelWeights = {
  Maxime: 0.7,
  Adrien: 0.8,
  Valentin: 0.2,
  Giacomo: 0.3
};
```
And, here is the result with only 2 models that are running:
![image](https://github.com/Ariboux/Workshop3/assets/95749329/bee920d3-af66-4419-bceb-a003afa5e056)
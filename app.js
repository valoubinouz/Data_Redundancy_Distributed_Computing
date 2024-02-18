const express = require('express');
const { spawn } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;

app.get('/predict', (req, res) => {
    // Get the query parameters for model features
    const { sepal_length, sepal_width, petal_length, petal_width } = req.query;

    // Spawn a Python process to use the pre-trained model for prediction
    const pythonProcess = spawn('python', ['random_forest_predict.py', sepal_length, sepal_width, petal_length, petal_width]);

    pythonProcess.stdout.on('data', (data) => {
        // Capture the standard output from the Python process
        try {
            const prediction = JSON.parse(data);
            res.json({
                status: 'success',
                data: prediction,
                message: 'random forest'
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                error: {
                    code: 500,
                    message: 'Error parsing prediction output.'
                }
            });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        // If there's an error in the Python script, send an error response
        res.status(500).json({
            status: 'error',
            error: {
                code: 500,
                message: data.toString()
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


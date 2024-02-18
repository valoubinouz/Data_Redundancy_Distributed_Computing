import sys
import json
from sklearn.datasets import load_iris
from sklearn.ensemble import RandomForestClassifier

# Load the Iris dataset and train the Random Forest model
iris = load_iris()
random_forest = RandomForestClassifier(n_estimators=100, random_state=42)
random_forest.fit(iris.data, iris.target)

# Retrieve arguments from the command line input
sepal_length, sepal_width, petal_length, petal_width = map(float, sys.argv[1:])

# Make a prediction
class_probabilities = random_forest.predict_proba([[sepal_length, sepal_width, petal_length, petal_width]])[0]
predicted_class = iris.target_names[random_forest.predict([[sepal_length, sepal_width, petal_length, petal_width]])[0]]

# Output the prediction with class probabilities as a JSON-formatted string
output_json = {
        "class_probabilities": {iris.target_names[i]: class_probabilities[i] for i in range(len(class_probabilities))}
}

print(json.dumps(output_json))

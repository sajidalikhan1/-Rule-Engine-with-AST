# Rule Engine Application with AST

## Overview

This is a full-stack Rule Engine application that uses an **Abstract Syntax Tree (AST)** to define and evaluate complex rules for determining user eligibility. The application consists of:

- **Backend**: A Node.js and Express server with MongoDB for storing and evaluating rules.
- **Frontend**: A React application with Material-UI for managing rule creation, display, and eligibility checks.

## Key Features

1. **Create Complex Rules**: Define eligibility rules using conditions and logical operators (`AND`, `OR`, `NOT`).

2. **Display Rules**: View all saved rules in a readable format on the frontend.

3. **Evaluate Eligibility**: Check if a user meets defined eligibility criteria based on the rules.

---

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [MongoDB](https://www.mongodb.com/) (for backend database)
- [npm](https://www.npmjs.com/) (Node package manager)

---

## Project Structure

- **Backend**: Located in the `backend` folder, which handles rule creation, storage, and evaluation.

- **Frontend**: Located in the `frontend` folder, which provides a user interface for interacting with the rule engine.

---

## Setup Instructions

### 1. Clone the Repository
---
```bash
git clone https://github.com/sajidalikhan1/-Rule-Engine-with-AST.git

cd <repository_name>
```


### 2. Backend Setup
---
**Navigate to the Backend Directory**

```bash
 cd backend
```

**Install Dependencies**
```bash
npm install
```

**Environment Variables**

create a ``.env``file in the ``backend`` directory and add the following:

```plaintext
MONGO_URI=<Your MongoDB URI>
PORT=5000
```

Replace ``<Your MongoDB URI>`` with your MongoDB connection string.

Run the Backend Server
```bash
node server.js
```

The backend server should now be running on ``http://localhost:5000.``


### 3. Frontend Setup
---

**Navigate to the Frontend Directory**

```bash
cd ../frontend
```

**Install Dependencies**
```bash
npm install
```

**Run the Frontend Server**
```bash
npm run dev
```
The frontend application should now be accessible


---
## Usage

### 1. Adding a New Rule

1. Open the frontend interface.

2. Use the "Add New Rule" section to define a rule. You can include conditions based on fields like ``age``, ``department``, ``salary``, and ``experience``.

3. Logical operators (``AND``, ``OR``) can be used to create complex expressions.

4. Click "Add Rule" to save the rule to the database. 

**Example rule:**

```plaintext
((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)
```

### 2. Viewing Current Rules

1. All saved rules are displayed in the "Current Rules" section.

2. Each rule is shown in a readable format, highlighting conditions and logical operators

### 3. Checking User Eligibility

1. In the "Check User Eligibility" section, enter details such as age, department, salary, and experience.

2. Click "Check Eligibility" to evaluate the user data against the defined rules.

3. The eligibility result (either "Eligible" or "Not Eligible") will display based on the user data provided.

---

## API Documentation (Backend)

### 1. Create a Rule

**Endpoint:** ``POST /api/rules/create_rule``

**Description:** Creates a new rule and stores it as an AST in MongoDB.

* Payload:
``` json
{
  "ruleString": "(age > 30 AND department = 'Sales') OR (salary > 50000)"
}
```

### 2. Get All Rules

**Endpoint:** ``GET /api/rules``

**Description:** Fetches all stored rules in AST format from MongoDB.

### 3. Evaluate User Eligibility

**Endpoint:** ``POST /api/rules/evaluate_rule``

- **Description:** Evaluates user data against a specified rule.

- **Payload:**
```json
 {
  "userData": {
    "age": 35,
    "department": "Sales",
    "salary": 60000,
    "experience": 5
  },
  "ruleId": "<rule_id>"
}
```

## Technologies Used

* **Frontend:** React, Material-UI

* **Backend:** Node.js, Express, MongoDB

* **Database:** MongoDB (for storing rules in AST format)

* **HTTP Client:** Axios for making API requests from the frontend to the backend

* **ODM:** Mongoose for MongoDB interactions in Node.js



## Troubleshooting

* **MongoDB Connection:** Ensure MongoDB is running and accessible using the connection string provided in ``MONGO_URI``.

* **Port Conflicts:** If other applications are running on ports 5000 (backend) or 3000 (frontend), stop them or configure different ports.

* **API Errors:** Check the backend console for detailed error messages if any API calls fail.



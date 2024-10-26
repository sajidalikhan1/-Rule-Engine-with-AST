// backend/routes/rules.js

const express = require("express");
const validateAttributes = require("../validators/attributes");

const Rule = require("../models/Rule");
const Node = require("../ast/Node");

const router = express.Router();

// In-memory storage for rules (Use a database in production)
let rules = [];

// POST route to add a new rule
router.post("/", async (req, res) => {
  try {
    const { name, conditions, actions } = req.body;

    // Validate and structure the nested condition
    const newRule = new Rule({ name, conditions, actions });
    await newRule.save();
    res.status(201).json(newRule);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding rule", error: error.message });
  }
});

// Fetch all rules from MongoDB
router.get("/", async (req, res) => {
  try {
    const rules = await Rule.find(); // Fetch all rules from the database
    res.status(200).json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    res.status(500).json({ error: "Failed to fetch rules" });
  }
});

function parseRuleStringToAST(ruleString) {
  // Regular expression to tokenize the rule string
  const tokens = ruleString.match(
    /([A-Za-z]+|>|<|=|>=|<=|!=|\d+|'[^']*'|\(|\)|AND|OR)/g
  );

  // Check if tokenization was successful
  if (!tokens) throw new Error("Failed to tokenize rule string");

  let currentIndex = 0;

  // Helper function to get the current token and move to the next one
  const nextToken = () => tokens[currentIndex++];
  const currentToken = () => tokens[currentIndex];

  // Parse an individual condition (operand)
  const parseCondition = () => {
    const field = nextToken();
    const operator = nextToken();
    let value = nextToken();
    value = value.replace(/'/g, ""); // Remove quotes if it's a string

    return new Node("operand", null, null, {
      field,
      operator,
      value: isNaN(value) ? value : Number(value),
    });
  };

  // Recursive function to parse logical expressions with parentheses support
  const parseExpression = () => {
    let leftNode;

    // Handle nested expressions with parentheses
    if (currentToken() === "(") {
      nextToken(); // Consume '('
      leftNode = parseExpression();
      nextToken(); // Consume ')'
    } else {
      leftNode = parseCondition();
    }

    // Parse logical operators ('AND'/'OR')
    while (currentToken() === "AND" || currentToken() === "OR") {
      const operator = nextToken();
      const operatorNode = new Node("operator", null, null, operator);

      let rightNode;
      if (currentToken() === "(") {
        nextToken(); // Consume '('
        rightNode = parseExpression();
        nextToken(); // Consume ')'
      } else {
        rightNode = parseCondition();
      }

      // Assign the left and right nodes to the operator node
      operatorNode.left = leftNode;
      operatorNode.right = rightNode;

      // Update leftNode to be the operator node, for potential further chaining
      leftNode = operatorNode;
    }

    return leftNode;
  };

  // Return the root of the AST
  return parseExpression();
}

// Function to validate rule string before parsing
function validateRuleString(ruleString) {
  // A basic validation: check if the rule contains supported operators and fields
  const validOperators = [">", "<", ">=", "<=", "==", "!=", "AND", "OR"];
  const validFields = ["age", "department", "salary", "experience"];

  for (let field of validFields) {
    if (!ruleString.includes(field)) {
      throw new Error(`Invalid rule: Field "${field}" is missing or incorrect`);
    }
  }

  for (let operator of validOperators) {
    if (!ruleString.includes(operator)) {
      throw new Error(
        `Invalid rule: Operator "${operator}" is missing or incorrect`
      );
    }
  }

  return true; // If valid
}

router.post("/create_rule", async (req, res) => {
  // Extract the data from the request body
  const { name, conditions, actions } = req.body; // Assuming the frontend sends JSON as { name, conditions, actions }

  try {
    // Create a new Rule document
    const newRule = new Rule({
      name,
      conditions, // Assuming conditions is a well-structured nested object as per the nodeSchema
    });

    // Save the Rule to MongoDB
    const savedRule = await newRule.save();
    // console.log(req.body);
    console.log(savedRule);

    // Return the saved rule as a response
    res
      .status(201)
      .json({ message: "Rule created successfully", rule: savedRule });
  } catch (error) {
    console.error("Error creating rule:", error);
    res.status(400).json({ error: "Error creating rule: " + error.message });
  }
});

async function saveASTToDatabase(node) {
  if (!node) return null;

  // Create a new document for the current node
  const newNode = {
    type: node.type,
    value: node.value || null,
    operator: node.operator || null,
    left: await saveASTToDatabase(node.left),
    right: await saveASTToDatabase(node.right),
  };

  // Save the node to MongoDB and return the saved document
  return new Rule(newNode).save();
}

const parseRule = (ruleString) => {
  // Here you can use a library like jsep or manually parse the string
  // For simplicity, we'll do a basic parser with nested logic using regex

  const parseCondition = (str) => {
    // A regex to match conditions like "age > 30"
    const conditionPattern = /(\w+)\s*(>|>=|<|<=|==|!=)\s*([\w\d]+)/;
    const match = str.match(conditionPattern);

    if (match) {
      return {
        type: "operand",
        value: {
          field: match[1],
          operator: match[2],
          value: isNaN(match[3]) ? match[3] : Number(match[3]),
        },
      };
    }
    return null;
  };

  const parseLogicalExpression = (str) => {
    // This function would recursively parse the logical structure of the rule string
    const operatorPattern = /\s*(AND|OR)\s*/;
    const parts = str.split(operatorPattern);

    if (parts.length === 3) {
      return {
        type: "operator",
        operator: parts[1],
        left:
          parseCondition(parts[0].trim()) ||
          parseLogicalExpression(parts[0].trim()),
        right:
          parseCondition(parts[2].trim()) ||
          parseLogicalExpression(parts[2].trim()),
      };
    }

    return parseCondition(str.trim());
  };

  // Remove outer parentheses and parse the main expression
  const mainExpression = ruleString.replace(/^\((.*)\)$/, "$1");
  return parseLogicalExpression(mainExpression);
};

module.exports = { parseRule };
// POST /evaluate_rule - Evaluate the user data against the stored AST rule
router.post("/evaluate_rule", async (req, res) => {
  const { userData, ruleId } = req.body;

  // Ensure ruleId and userData are provided
  if (!ruleId || !userData) {
    return res.status(400).json({ error: "Missing ruleId or userData" });
  }

  try {
    // Find the rule by ID
    const rule = await Rule.findById(ruleId).exec();
    console.log("Fetched Rule:", JSON.stringify(rule, null, 2));

    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    // Evaluate the rule against user data
    const isEligible = evaluateAST(rule.conditions, userData);
    res.json({ isEligible });
  } catch (error) {
    res.status(500).json({ error: "Error evaluating rule: " + error.message });
  }
});

// Evaluate AST function
function evaluateAST(node, userData) {
  if (node.type === "operand") {
    const { field, operator, value } = node.value;
    let userValue = userData[field];

    // Convert userValue to number if necessary
    if (typeof userValue === "string") {
      userValue = parseFloat(userValue);
    }

    // console.log(Evaluating: ${field} ${operator} ${userValue} against ${value});

    switch (operator) {
      case ">":
        return userValue > value;
      case ">=":
        return userValue >= value;
      case "<":
        return userValue < value;
      case "<=":
        return userValue <= value;
      case "==":
        return userValue == value;
      case "!=":
        return userValue != value;
      default:
        return false; // Unrecognized operator
    }
  }

  if (node.type === "operator") {
    const leftResult = evaluateAST(node.left, userData);
    const rightResult = evaluateAST(node.right, userData);

    // console.log(Evaluating: ${node.operator} with leftResult: ${leftResult} and rightResult: ${rightResult});

    if (node.operator === "AND") {
      return leftResult && rightResult;
    }
    if (node.operator === "OR") {
      return leftResult || rightResult;
    }
  }

  return false; // Default case if neither operand nor operator
}

// POST /evaluate_rule - Evaluate user data against the AST rule stored in MongoDB
router.post("/evaluate_rule", async (req, res) => {
  const { userData, ruleId } = req.body;

  try {
    // Fetch rule by ID from MongoDB
    const rule = await Rule.findById(ruleId).exec();

    if (!rule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    // Evaluate user data against the fetched rule (AST)
    const isEligible = evaluateAST(rule, userData);

    res.json({ isEligible });
  } catch (error) {
    res.status(400).json({ error: "Error evaluating rule: " + error.message });
  }
});

// backend/routes/rules.js

// PUT /modify_rule - Modify existing rule
router.put("/modify_rule/:id", async (req, res) => {
  const { id } = req.params;
  const { newRuleString } = req.body;

  try {
    // Find the existing rule
    const existingRule = await Rule.findById(id);

    if (!existingRule) {
      return res.status(404).json({ error: "Rule not found" });
    }

    // Validate the new rule string and parse it into AST
    validateRuleString(newRuleString);
    const newAST = parseRuleStringToAST(newRuleString);

    // Update the rule in the database
    existingRule.type = newAST.type;
    existingRule.left = newAST.left;
    existingRule.right = newAST.right;
    existingRule.value = newAST.value;
    await existingRule.save();

    res
      .status(200)
      .json({ message: "Rule modified successfully", rule: existingRule });
  } catch (error) {
    res.status(400).json({ error: "Error modifying rule: " + error.message });
  }
});

module.exports = router;

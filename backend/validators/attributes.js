// backend/validators/attributes.js

const attributeCatalog = ["age", "department", "salary", "experience"];

// Function to check if attributes in the rule string are valid
function validateAttributes(ruleString) {
  const foundAttributes = ruleString.match(/age|department|salary|experience/g);

  if (!foundAttributes || foundAttributes.length === 0) {
    throw new Error("Rule must contain at least one valid attribute");
  }

  for (let attr of foundAttributes) {
    if (!attributeCatalog.includes(attr)) {
      throw new Error(`Invalid attribute found: ${attr}`);
    }
  }

  return true;
}

module.exports = validateAttributes;

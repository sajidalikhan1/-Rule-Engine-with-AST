// backend/models/Rule.js

const mongoose = require("mongoose");

// Schema for nested nodes (conditions)
const nodeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["operator", "operand"],
    required: true,
  },
  operator: {
    type: String,
    enum: ["AND", "OR"], // Specify the valid logical operators
    required: function () {
      return this.type === "operator";
    }, // Required for operators
  },
  left: {
    type: mongoose.Schema.Types.Mixed, // To allow for different types of nodes
    required: false,
  },
  right: {
    type: mongoose.Schema.Types.Mixed, // To allow for different types of nodes
    required: false,
  },
  value: {
    field: {
      type: String,
      required: function () {
        return this.type === "operand";
      }, // Required for operand
    },
    operator: {
      type: String,
      required: function () {
        return this.type === "operand";
      }, // Required for operand
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: function () {
        return this.type === "operand";
      }, // Required for operand
    },
  },
});

// Main schema for a Rule with conditions and actions
const ruleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    conditions: {
      type: nodeSchema, // Nested condition tree
      required: true,
    },
  },
  { timestamps: true } // This will add createdAt and updatedAt fields
);

const Rule = mongoose.model("Rule", ruleSchema);

module.exports = Rule;

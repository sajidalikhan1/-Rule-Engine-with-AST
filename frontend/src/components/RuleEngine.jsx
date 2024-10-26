import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from "@mui/material";
import api from "../services/api";

function RuleEngine() {
  const [userData, setUserData] = useState({
    age: "",
    department: "",
    salary: "",
    experience: "",
  });

  const [newRule, setNewRule] = useState({
    name: "",
    conditions: {
      type: "operator",
      operator: "AND", // Default operator
      left: { type: "operand", value: { field: "", operator: "", value: "" } },
      right: { type: "operand", value: { field: "", operator: "", value: "" } },
    },
  });

  const [rules, setRules] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [userValidationError, setUserValidationError] = useState("");

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get("/rules");
      setRules(response.data);
    } catch (error) {
      setRules([]);
    }
  };

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRuleChange = (e) => {
    const { name, value } = e.target;
    setNewRule((prevRule) => {
      const keys = name.split(".");
      const updatedRule = { ...prevRule };
      let current = updatedRule;

      keys.slice(0, -1).forEach((key) => {
        if (!current[key]) current[key] = {};
        current = current[key];
      });

      current[keys[keys.length - 1]] = value;
      return updatedRule;
    });
  };

  const addRule = async () => {
    const { field, operator, value } = newRule.conditions.left.value;
    const {
      field: rightField,
      operator: rightOperator,
      value: rightValue,
    } = newRule.conditions.right.value;

    if (
      !field ||
      !operator ||
      value === "" ||
      !rightField ||
      !rightOperator ||
      rightValue === ""
    ) {
      setValidationError("Please fill out all rule fields before submitting.");
      return;
    }

    try {
      await api.post("/rules/create_rule", newRule);
      setNewRule({
        name: "",
        conditions: {
          type: "operator",
          operator: "AND", // Reset to default operator
          left: {
            type: "operand",
            value: { field: "", operator: "", value: "" },
          },
          right: {
            type: "operand",
            value: { field: "", operator: "", value: "" },
          },
        },
      });
      setValidationError("");
      fetchRules();
    } catch (error) {
      setValidationError(
        "Failed to add rule. " +
          (error.response ? error.response.data.message : "")
      );
    }
  };

  const validateUserInput = () => {
    if (
      !userData.age ||
      !userData.department ||
      !userData.salary ||
      !userData.experience
    ) {
      setUserValidationError(
        "Please fill out all user fields before checking eligibility."
      );
      return false;
    }
    setUserValidationError("");
    return true;
  };

  const checkEligibility = async () => {
    if (!validateUserInput()) return;

    try {
      const response = await api.post("/rules/evaluate_rule", {
        userData,
        ruleId: rules[0]?._id,
      });
      setEligibility(response.data.isEligible);
    } catch (error) {
      setEligibility(null);
      setUserValidationError("Failed to evaluate eligibility.");
    }
  };

  const renderRuleString = (rule) => {
    if (!rule || typeof rule !== "object") return "Invalid rule";

    if (rule.type === "operand") {
      return `${rule.value.field} ${rule.value.operator} ${rule.value.value}`;
    } else if (rule.type === "operator") {
      return `(${renderRuleString(rule.left)} ${
        rule.operator
      } ${renderRuleString(rule.right)})`;
    }

    return "Unknown rule type";
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Section to add new rules */}
      <Paper style={{ padding: 16, marginBottom: 16 }}>
        <Typography variant="h6">Add New Rule</Typography>
        {validationError && <Alert severity="error">{validationError}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              name="name"
              label="Rule Name"
              fullWidth
              value={newRule.name}
              onChange={handleRuleChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Left Field</InputLabel>
              <Select
                name="conditions.left.value.field"
                value={newRule.conditions.left.value.field || ""}
                onChange={handleRuleChange}
              >
                <MenuItem value="age">Age</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              name="conditions.left.value.operator"
              label="Left Operator (>, >=, ==)"
              fullWidth
              value={newRule.conditions.left.value.operator || ""}
              onChange={handleRuleChange}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              name="conditions.left.value.value"
              label="Left Value"
              fullWidth
              value={newRule.conditions.left.value.value || ""}
              onChange={handleRuleChange}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Logical Operator</InputLabel>
              <Select
                name="conditions.operator"
                value={newRule.conditions.operator || "AND"}
                onChange={handleRuleChange}
              >
                <MenuItem value="AND">AND</MenuItem>
                <MenuItem value="OR">OR</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Right Field</InputLabel>
              <Select
                name="conditions.right.value.field"
                value={newRule.conditions.right.value.field || ""}
                onChange={handleRuleChange}
              >
                <MenuItem value="age">Age</MenuItem>
                <MenuItem value="salary">Salary</MenuItem>
                <MenuItem value="department">Department</MenuItem>
                <MenuItem value="experience">Experience</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              name="conditions.right.value.operator"
              label="Right Operator"
              fullWidth
              value={newRule.conditions.right.value.operator || ""}
              onChange={handleRuleChange}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              name="conditions.right.value.value"
              label="Right Value"
              fullWidth
              value={newRule.conditions.right.value.value || ""}
              onChange={handleRuleChange}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Button variant="contained" fullWidth onClick={addRule}>
              Add Rule
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Section to display current rules */}
      <Paper style={{ padding: 16, marginBottom: 16 }}>
        <Typography variant="h6">Current Rules</Typography>
        {rules.length === 0 ? (
          <Typography>No rules available.</Typography>
        ) : (
          rules.map((rule, index) => (
            <Typography key={index}>
              {renderRuleString(rule.conditions)}
            </Typography>
          ))
        )}
      </Paper>

      {/* Section to check user eligibility */}
      <Paper style={{ padding: 16 }}>
        <Typography variant="h6">Check User Eligibility</Typography>
        {userValidationError && (
          <Alert severity="error">{userValidationError}</Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              name="age"
              label="Age"
              fullWidth
              value={userData.age}
              onChange={handleUserChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              name="department"
              label="Department"
              fullWidth
              value={userData.department}
              onChange={handleUserChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              name="salary"
              label="Salary"
              fullWidth
              value={userData.salary}
              onChange={handleUserChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              name="experience"
              label="Experience"
              fullWidth
              value={userData.experience}
              onChange={handleUserChange}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button variant="contained" fullWidth onClick={checkEligibility}>
              Check Eligibility
            </Button>
          </Grid>
        </Grid>
        {eligibility !== null && (
          <Typography variant="h6" style={{ marginTop: 20 }}>
            Eligibility: {eligibility ? "Eligible" : "Not Eligible"}
          </Typography>
        )}
      </Paper>
    </div>
  );
}

export default RuleEngine;

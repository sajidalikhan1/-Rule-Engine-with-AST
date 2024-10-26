// backend/ast/Node.js

class Node {
  constructor(type, left = null, right = null, value = null) {
    this.type = type; // "operator" or "operand"
    this.left = left; // Left child node
    this.right = right; // Right child node
    this.value = value; // Value for operand nodes
  }
}

module.exports = Node;

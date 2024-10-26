// frontend/src/App.jsx

import React from 'react';
import { Container, Typography } from '@mui/material';
import RuleEngine from './components/RuleEngine';

function App() {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Rule Engine Application
      </Typography>
      <RuleEngine />
    </Container>
  );
}

export default App;

// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';

// Find the root element in your HTML
const rootElement = document.getElementById('root');

// Create a root and render the app using createRoot
const root = ReactDOM.createRoot(rootElement);

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

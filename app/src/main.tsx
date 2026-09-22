import React from 'react';
import { createRoot } from 'react-dom/client';
import { FileRouter } from './components/app/src/components/file-kit';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<FileRouter><App /></FileRouter>);

import React from 'react';
import { render, screen } from '@testing-library/react';
import NewStudentPortal from './components/NewStudentPortal';

test('renders Student Portal text', () => {
  render(<NewStudentPortal />);
  const portalTexts = screen.queryAllByText(/Student Portal/i);
  expect(portalTexts.length).toBeGreaterThan(0);
});

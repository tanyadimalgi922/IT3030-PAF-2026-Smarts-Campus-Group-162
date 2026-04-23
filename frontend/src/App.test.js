import { render, screen } from '@testing-library/react';
import App from './App';

test('renders smart campus login screen', () => {
  render(<App />);
  const linkElement = screen.getByText(/sign in to smart campus/i);
  expect(linkElement).toBeInTheDocument();
});

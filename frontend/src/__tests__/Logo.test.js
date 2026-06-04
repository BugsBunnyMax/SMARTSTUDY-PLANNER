import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from '../components/Logo';

describe('Logo Component', () => {
  it('should render without crashing', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have correct viewBox', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
  });
});

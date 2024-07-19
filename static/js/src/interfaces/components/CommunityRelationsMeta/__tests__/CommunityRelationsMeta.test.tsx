import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommunityRelationsMeta from '../CommunityRelationsMeta';

const renderComponent = () => {
  render(<CommunityRelationsMeta />);
};

describe('CommunityRelationsMeta Component', () => {
  test('renders heading and description', () => {
    renderComponent();

    expect(screen.getByText('Help us test this interface')).toBeInTheDocument();
    expect(
      screen.getByText(
        'This interface doesn\'t have a schema yet, help the community and get involved.'
      )
    ).toBeInTheDocument();
  });

  test('renders contribute button with correct href', () => {
    renderComponent();

    const link = screen.getByRole('link', { name: 'Contribute' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      'https://github.com/canonical/charm-relation-interfaces'
    );
  });

  test('renders contribute button with correct appearance', () => {
    renderComponent();

    const link = screen.getByRole('link', { name: 'Contribute' });
    expect(link).toHaveClass('p-button--positive');
  });
});

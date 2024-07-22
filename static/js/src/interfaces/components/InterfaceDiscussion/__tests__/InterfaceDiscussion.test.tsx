import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InterfaceDiscussion from '../InterfaceDiscussion';

jest.mock('@canonical/react-components', () => ({
  Button: jest.fn(({ children, element, href }) => (
    <a href={href} className="mock-button">
      {children}
    </a>
  )),
}));

describe('InterfaceDiscussion', () => {
  test('renders heading and paragraphs correctly', () => {
    render(<InterfaceDiscussion />);

    const heading = screen.getByText('Discuss this interface');
    expect(heading).toBeInTheDocument();

    const paragraph1 = screen.getByText(
      'Share your thoughts on this interface with the community on discourse'
    );
    expect(paragraph1).toBeInTheDocument();

    const paragraph2 = screen.getByText('Join the discussion');
    expect(paragraph2).toBeInTheDocument();
  });

  test('renders the Join the discussion button with correct attributes', () => {
    render(<InterfaceDiscussion />);

    const button = screen.getByText('Join the discussion');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute(
      'href',
      'https://discourse.charmhub.io/t/implementing-relations/1051'
    );
  });
});

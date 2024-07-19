import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CanonicalRelationsMeta from '../CanonicalRelationsMeta';

const renderComponent = (props: { interfaceName: string | undefined; interfaceVersion: string }) => {
  render(<CanonicalRelationsMeta {...props} />);
};

describe('CanonicalRelationsMeta', () => {
  test('renders heading and description', () => {
    renderComponent({ interfaceName: 'some-interface', interfaceVersion: '1.0' });

    expect(screen.getByText('Help us improve this page')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Most of this content can be collaboratively discussed and changed in the respective README file.'
      )
    ).toBeInTheDocument();
  });

  test('renders contribute button with correct href', () => {
    const interfaceName = 'some-interface';
    const interfaceVersion = '1.0';

    renderComponent({ interfaceName, interfaceVersion });

    const link = screen.getByRole('link', { name: 'Contribute' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      `https://github.com/canonical/charm-relation-interfaces/blob/main/interfaces/${interfaceName}/v${interfaceVersion}/README.md`
    );
  });

  test('renders contribute button with correct href when interfaceName is undefined', () => {
    const interfaceVersion = '1.0';

    renderComponent({ interfaceName: undefined, interfaceVersion });

    const link = screen.getByRole('link', { name: 'Contribute' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      `https://github.com/canonical/charm-relation-interfaces/blob/main/interfaces/v${interfaceVersion}/README.md`
    );
  });

  test('renders contribute button with correct appearance', () => {
    renderComponent({ interfaceName: 'some-interface', interfaceVersion: '1.0' });

    const link = screen.getByRole('link', { name: 'Contribute' });
    expect(link).toHaveClass('p-button--positive');
  });
});

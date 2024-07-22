import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import InterfaceDetailsLinks from '../InterfaceDetailsLinks';

describe('InterfaceDetailsLinks', () => {
  test('renders heading', () => {
    render(<InterfaceDetailsLinks isCommunity={false} interfaceName="testInterface" interfaceVersion="1.0" />);
    
    expect(screen.getByText('Relevant links')).toBeInTheDocument();
  });

  test('renders "Submit a bug" link with correct href when isCommunity is false', () => {
    render(<InterfaceDetailsLinks isCommunity={false} interfaceName="testInterface" interfaceVersion="1.0" />);
    
    const submitBugLink = screen.getByText('Submit a bug').closest('a');
    expect(submitBugLink).toHaveAttribute('href', 'https://github.com/canonical/charm-relation-interfaces/issues/new?title=testInterface+1.0');
    
    const icon = screen.getByText('Submit a bug').querySelector('i');
    expect(icon).toHaveClass('p-icon--submit-bug');
  });

  test('renders "Submit a bug" link with correct href when isCommunity is true', () => {
    render(<InterfaceDetailsLinks isCommunity={true} interfaceName="testInterface" interfaceVersion="1.0" />);
    
    const submitBugLink = screen.getByText('Submit a bug').closest('a');
    expect(submitBugLink).toHaveAttribute('href', 'https://github.com/canonical/charm-relation-interfaces/issues/new?title=(Untested)+testInterface+1.0');
    
    const icon = screen.getByText('Submit a bug').querySelector('i');
    expect(icon).toHaveClass('p-icon--submit-bug');
  });

  test('does not render "Specification archive" link when isCommunity is true', () => {
    render(<InterfaceDetailsLinks isCommunity={true} interfaceName="testInterface" interfaceVersion="1.0" />);
    
    expect(screen.queryByText('Specification archive')).toBeNull();
  });

  test('renders "Specification archive" link with correct href when isCommunity is false', () => {
    render(<InterfaceDetailsLinks isCommunity={false} interfaceName="testInterface" interfaceVersion="1.0" />);
    
    const specificationArchiveLink = screen.getByText('Specification archive').closest('a');
    expect(specificationArchiveLink).toHaveAttribute('href', 'https://github.com/canonical/charm-relation-interfaces/tree/main/interfaces/testInterface');
    
    const icon = screen.getByText('Specification archive').querySelector('i');
    expect(icon).toHaveClass('p-icon--archive');
  });

  test('renders with no interface version', () => {
    render(<InterfaceDetailsLinks isCommunity={false} interfaceName="testInterface" interfaceVersion={undefined} />);
    
    const submitBugLink = screen.getByText('Submit a bug').closest('a');
    expect(submitBugLink).toHaveAttribute('href', 'https://github.com/canonical/charm-relation-interfaces/issues/new?title=testInterface');
    
    const icon = screen.getByText('Submit a bug').querySelector('i');
    expect(icon).toHaveClass('p-icon--submit-bug');
  });
});

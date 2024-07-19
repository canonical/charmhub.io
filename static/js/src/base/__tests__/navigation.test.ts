import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';
import { toggleDropdown, closeAllDropdowns, handleClickOutside } from '../navigation';

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ account: { 'display-name': 'John Doe' } }),
  })
) as jest.Mock;

describe('Navigation dropdown', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('toggleDropdown opens and closes the dropdown', () => {
    const parent = document.createElement('div');
    const toggle = document.createElement('button');
    const dropdown = document.createElement('div');
    dropdown.setAttribute('id', 'dropdown');
    toggle.setAttribute('aria-controls', 'dropdown');

    document.body.appendChild(parent);
    parent.appendChild(toggle);
    document.body.appendChild(dropdown);

    toggleDropdown(toggle, true);
    expect(dropdown.getAttribute('aria-hidden')).toBe('false');
    expect(parent.classList).toContain('is-active');

    // Close the dropdown
    toggleDropdown(toggle, false);
    expect(dropdown.getAttribute('aria-hidden')).toBe('true');
    expect(parent.classList).not.toContain('is-active');
  });

  test('closeAllDropdowns closes all dropdowns', () => {
    const parent1 = document.createElement('div');
    const toggle1 = document.createElement('button');
    const dropdown1 = document.createElement('div');
    dropdown1.setAttribute('id', 'dropdown1');
    toggle1.setAttribute('aria-controls', 'dropdown1');

    const parent2 = document.createElement('div');
    const toggle2 = document.createElement('button');
    const dropdown2 = document.createElement('div');
    dropdown2.setAttribute('id', 'dropdown2');
    toggle2.setAttribute('aria-controls', 'dropdown2');

    document.body.appendChild(parent1);
    parent1.appendChild(toggle1);
    document.body.appendChild(dropdown1);

    document.body.appendChild(parent2);
    parent2.appendChild(toggle2);
    document.body.appendChild(dropdown2);

    // Open both dropdowns
    toggleDropdown(toggle1, true);
    toggleDropdown(toggle2, true);

    closeAllDropdowns([toggle1, toggle2]);

    expect(dropdown1.getAttribute('aria-hidden')).toBe('true');
    expect(dropdown2.getAttribute('aria-hidden')).toBe('true');
    expect(parent1.classList).not.toContain('is-active');
    expect(parent2.classList).not.toContain('is-active');
  });

  test('handleClickOutside closes dropdowns when clicking outside', () => {
    const parent = document.createElement('div');
    const toggle = document.createElement('button');
    const dropdown = document.createElement('div');
    dropdown.setAttribute('id', 'dropdown');
    toggle.setAttribute('aria-controls', 'dropdown');

    document.body.appendChild(parent);
    parent.appendChild(toggle);
    document.body.appendChild(dropdown);

    toggleDropdown(toggle, true);

    handleClickOutside([toggle], '.container');

    fireEvent.click(document.body);

    expect(dropdown.getAttribute('aria-hidden')).toBe('true');
    expect(parent.classList).not.toContain('is-active');
  });
});

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import MermaidDiagram from '../MermaidDiagram';
import mermaid from 'mermaid';

jest.mock('mermaid', () => ({
  render: jest.fn(),
}));

describe('MermaidDiagram', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the mermaid diagram', async () => {
    const mockSvg = '<svg>mock diagram</svg>';
    (mermaid.render as jest.Mock).mockResolvedValueOnce({ svg: mockSvg });

    const { container } = render(<MermaidDiagram code="graph TD; A-->B;" />);

    expect(mermaid.render).toHaveBeenCalledWith('mermaidId', 'graph TD; A-->B;');

    await waitFor(() => {
      expect(container.querySelector('.mermaid-diagram-container')?.innerHTML).toBe(mockSvg);
    });
  });

  test('handles rendering error', async () => {
    const mockError = new Error('Mock render error');
    (mermaid.render as jest.Mock).mockRejectedValueOnce(mockError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<MermaidDiagram code="graph TD; A-->B;" />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Mermaid diagram rendering error:', mockError);
    });

    consoleErrorSpy.mockRestore();
  });
});

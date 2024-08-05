import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Topics from "../Topics";
import { QueryClient, QueryClientProvider } from "react-query";
import "@testing-library/jest-dom";

(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ topics: [] }),
  })
);

const queryClient = new QueryClient();

const renderWithQueryClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("Topics Component", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("renders loading cards", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve({ topics: [] }),
    });

    renderWithQueryClient(<Topics topicsQuery={null} />);

    await waitFor(() => {
      const loadingCards = screen.getAllByRole("group");
      expect(loadingCards).toHaveLength(3);
      loadingCards.forEach((card) => {
        expect(card).toHaveStyle({ height: "180px" });
      });
    });
  });

  test("renders topics correctly when data is loaded", async () => {
    const mockTopics = [
      {
        topic_id: 1,
        name: "Topic 1",
        slug: "topic-1",
        description: "Description 1",
        categories: [],
      },
      {
        topic_id: 2,
        name: "Topic 2",
        slug: "topic-2",
        description: "Description 2",
        categories: [],
      },
      {
        topic_id: 3,
        name: "Topic 3",
        slug: "topic-3",
        description: "Description 3",
        categories: [],
      },
    ];

    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ topics: mockTopics }),
      })
    );

    renderWithQueryClient(<Topics topicsQuery="test" />);

    await waitFor(() => {
      mockTopics.forEach((topic) => {
        expect(screen.getByText(topic.name)).toBeInTheDocument();
      });
    });
  });

  test("renders empty state when no topics are available", async () => {
    (global as any).fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ topics: [] }),
      })
    );

    renderWithQueryClient(<Topics topicsQuery="test" />);

    await waitFor(() => {
      expect(screen.queryByText(/Topic/)).not.toBeInTheDocument();
      expect(screen.getByText(/See all topics/)).toBeInTheDocument();
    });
  });

  test("handles fetch errors", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Fetch error")));

    renderWithQueryClient(<Topics topicsQuery="test" />);

    await waitFor(() => {
      expect(screen.queryByText(/Topic/)).not.toBeInTheDocument();
      expect(screen.getByText(/See all topics/)).toBeInTheDocument();
    });
  });
});

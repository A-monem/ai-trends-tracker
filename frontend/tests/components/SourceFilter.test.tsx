import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SourceFilter } from "../../src/components/SourceFilter";
import type { Source } from "../../src/types";

const mockSources: Source[] = [
  {
    id: "1",
    name: "TechCrunch",
    slug: "techcrunch",
    type: "rss",
    feedUrl: "https://techcrunch.com/feed",
    websiteUrl: "https://techcrunch.com",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    articleCount: 10,
  },
  {
    id: "2",
    name: "VentureBeat",
    slug: "venturebeat",
    type: "rss",
    feedUrl: "https://venturebeat.com/feed",
    websiteUrl: "https://venturebeat.com",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    articleCount: 5,
  },
];

describe("SourceFilter", () => {
  it("renders All button", () => {
    render(
      <SourceFilter
        sources={mockSources}
        selected={null}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("All")).toBeInTheDocument();
  });

  it("renders all source names", () => {
    render(
      <SourceFilter
        sources={mockSources}
        selected={null}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText(/TechCrunch/)).toBeInTheDocument();
    expect(screen.getByText(/VentureBeat/)).toBeInTheDocument();
  });

  it("shows article count for sources", () => {
    render(
      <SourceFilter
        sources={mockSources}
        selected={null}
        onSelect={() => {}}
      />,
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onSelect with null when All is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <SourceFilter
        sources={mockSources}
        selected="techcrunch"
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByText("All"));
    expect(handleSelect).toHaveBeenCalledWith(null);
  });

  it("calls onSelect with source slug when source is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <SourceFilter
        sources={mockSources}
        selected={null}
        onSelect={handleSelect}
      />,
    );

    fireEvent.click(screen.getByText(/TechCrunch/));
    expect(handleSelect).toHaveBeenCalledWith("techcrunch");
  });

  it("shows loading skeleton when isLoading is true", () => {
    render(
      <SourceFilter
        sources={[]}
        selected={null}
        onSelect={() => {}}
        isLoading={true}
      />,
    );
    expect(screen.queryByText("All")).not.toBeInTheDocument();
  });
});

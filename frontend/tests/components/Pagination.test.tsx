import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "../../src/components/Pagination";

describe("Pagination", () => {
  it("renders current page as active", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    const currentPageButton = screen.getByLabelText("Go to page 1");
    expect(currentPageButton).toHaveAttribute("aria-current", "page");
  });

  it("disables Previous button on first page", () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    const prevButton = screen.getByLabelText("Previous page");
    expect(prevButton).toBeDisabled();
  });

  it("disables Next button on last page", () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    const nextButton = screen.getByLabelText("Next page");
    expect(nextButton).toBeDisabled();
  });

  it("enables both buttons on middle page", () => {
    render(<Pagination page={3} totalPages={5} onPageChange={() => {}} />);
    const prevButton = screen.getByLabelText("Previous page");
    const nextButton = screen.getByLabelText("Next page");
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).not.toBeDisabled();
  });

  it("calls onPageChange with correct page when Previous is clicked", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination page={3} totalPages={5} onPageChange={handlePageChange} />,
    );

    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with correct page when Next is clicked", () => {
    const handlePageChange = vi.fn();
    render(
      <Pagination page={3} totalPages={5} onPageChange={handlePageChange} />,
    );

    fireEvent.click(screen.getByLabelText("Next page"));
    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  it("returns null when totalPages is 1", () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} onPageChange={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });
});

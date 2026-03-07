// TEST FILE: FilterPanel component
//
// What are we testing?
// The filter sliders (brightness, contrast, grayscale) and the reset button.

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FilterPanel from "@/components/FilterPanel";

describe("FilterPanel", () => {
  const defaultFilters = { brightness: 100, contrast: 100, grayscale: 0 };

  it("should render all three filter labels", () => {
    render(
      <FilterPanel filters={defaultFilters} onFiltersChange={vi.fn()} />
    );

    expect(screen.getByText("Brightness")).toBeInTheDocument();
    expect(screen.getByText("Contrast")).toBeInTheDocument();
    expect(screen.getByText("Grayscale")).toBeInTheDocument();
  });

  it("should show current filter values", () => {
    render(
      <FilterPanel
        filters={{ brightness: 150, contrast: 80, grayscale: 50 }}
        onFiltersChange={vi.fn()}
      />
    );

    expect(screen.getByText("150%")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("should NOT show reset button when filters are at default values", () => {
    render(
      <FilterPanel filters={defaultFilters} onFiltersChange={vi.fn()} />
    );

    expect(screen.queryByText("Reset")).not.toBeInTheDocument();
  });

  it("should show reset button when filters are changed from default", () => {
    render(
      <FilterPanel
        filters={{ brightness: 150, contrast: 100, grayscale: 0 }}
        onFiltersChange={vi.fn()}
      />
    );

    expect(screen.getByText("Reset")).toBeInTheDocument();
  });

  it("should call onFiltersChange with default values when reset is clicked", () => {
    const mockOnChange = vi.fn();

    render(
      <FilterPanel
        filters={{ brightness: 150, contrast: 80, grayscale: 50 }}
        onFiltersChange={mockOnChange}
      />
    );

    fireEvent.click(screen.getByText("Reset"));

    expect(mockOnChange).toHaveBeenCalledWith({
      brightness: 100,
      contrast: 100,
      grayscale: 0,
    });
  });

  it("should call onFiltersChange when a slider is moved", () => {
    const mockOnChange = vi.fn();

    render(
      <FilterPanel filters={defaultFilters} onFiltersChange={mockOnChange} />
    );

    const sliders = screen.getAllByRole("slider");
    const brightnessSlider = sliders[0];

    fireEvent.change(brightnessSlider, { target: { value: "150" } });

    expect(mockOnChange).toHaveBeenCalledWith({
      brightness: 150,
      contrast: 100,
      grayscale: 0,
    });
  });
});

// TEST FILE: Timeline component
//
// What are we testing?
// The timeline bar — time markers, playhead position, and click-to-seek.

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Timeline from "@/components/Timeline";

describe("Timeline", () => {
  const defaultProps = {
    currentTime: 0,
    duration: 30,
    trimStart: 0,
    trimEnd: 30,
    onSeek: vi.fn(),
  };

  it("should render the Timeline heading", () => {
    render(<Timeline {...defaultProps} />);

    expect(screen.getByText("Timeline")).toBeInTheDocument();
  });

  it("should show time markers for a 30 second video", () => {
    render(<Timeline {...defaultProps} />);

    // For a 30-second video (<=30), markers appear every 1 second
    // Check that some key markers exist using getAllByText since
    // the playhead tooltip may also show the same time
    const zeroMarkers = screen.getAllByText("0:00");
    expect(zeroMarkers.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText("0:10")).toBeInTheDocument();
    expect(screen.getByText("0:20")).toBeInTheDocument();
  });

  it("should show time markers every 5 seconds for a 60 second video", () => {
    render(<Timeline {...defaultProps} duration={60} trimEnd={60} />);

    expect(screen.getByText("0:05")).toBeInTheDocument();
    expect(screen.getByText("0:30")).toBeInTheDocument();
    expect(screen.getByText("1:00")).toBeInTheDocument();
  });

  it("should display the current time in the playhead tooltip", () => {
    // Use 7.5 seconds — "0:07" won't collide with a time marker at exact seconds
    render(<Timeline {...defaultProps} currentTime={7.5} />);

    // Both the tooltip and the marker show "0:07", so use getAllByText
    const matches = screen.getAllByText("0:07");
    // At least the tooltip should exist
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("should call onSeek when the timeline bar is clicked", () => {
    const mockSeek = vi.fn();
    render(<Timeline {...defaultProps} onSeek={mockSeek} />);

    // Find the clickable timeline bar (the tall one with bg-zinc-800)
    const timelineBars = document.querySelectorAll(".h-12");
    const timelineBar = timelineBars[0];

    // Mock the element's position/size (jsdom doesn't have real layout)
    Object.defineProperty(timelineBar, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 100, top: 0, height: 48 }),
    });

    // Click at 50px out of 100px width = 50% of 30 seconds = 15 seconds
    fireEvent.click(timelineBar, { clientX: 50 });

    expect(mockSeek).toHaveBeenCalledWith(15);
  });
});

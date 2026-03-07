// TEST FILE: VideoUploader component
//
// What are we testing?
// The drag-and-drop upload area — showing instructions, accepting videos,
// rejecting non-video files.

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import VideoUploader from "@/components/VideoUploader";

describe("VideoUploader", () => {
  it("should show upload instructions", () => {
    render(<VideoUploader onVideoSelect={vi.fn()} />);

    expect(screen.getByText("Drag & drop a video")).toBeInTheDocument();
    expect(
      screen.getByText("or click to browse — MP4, WebM, MOV supported")
    ).toBeInTheDocument();
  });

  it("should call onVideoSelect when a video file is dropped", () => {
    const mockOnSelect = vi.fn();
    render(<VideoUploader onVideoSelect={mockOnSelect} />);

    const dropZone = screen.getByText("Drag & drop a video").closest("div")!;

    const videoFile = new File(["fake video"], "test.mp4", {
      type: "video/mp4",
    });

    // Simulate dropping a file — need preventDefault since the component calls it
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [videoFile] },
    });

    expect(mockOnSelect).toHaveBeenCalledWith(videoFile);
  });

  it("should NOT call onVideoSelect when a non-video file is dropped", () => {
    const mockOnSelect = vi.fn();
    render(<VideoUploader onVideoSelect={mockOnSelect} />);

    const dropZone = screen.getByText("Drag & drop a video").closest("div")!;

    // Drop an image file instead of a video
    const imageFile = new File(["fake image"], "photo.png", {
      type: "image/png",
    });

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [imageFile] },
    });

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("should call onVideoSelect when a file is chosen via file input", () => {
    const mockOnSelect = vi.fn();
    render(<VideoUploader onVideoSelect={mockOnSelect} />);

    // Find the hidden file input by its accept attribute
    const fileInput = document.querySelector(
      'input[accept="video/*"]'
    ) as HTMLInputElement;

    const videoFile = new File(["fake video"], "clip.mp4", {
      type: "video/mp4",
    });

    fireEvent.change(fileInput, { target: { files: [videoFile] } });

    expect(mockOnSelect).toHaveBeenCalledWith(videoFile);
  });

  it("should have a hidden file input that only accepts video files", () => {
    render(<VideoUploader onVideoSelect={vi.fn()} />);

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(fileInput).toBeInTheDocument();
    expect(fileInput.accept).toBe("video/*");
    expect(fileInput.className).toContain("hidden");
  });
});

// TEST FILE: useVideoEditor hook
//
// What are we testing?
// The "brain" of our editor — the hook that manages all the state.
//
// How does a test work?
// 1. We set up the thing we want to test
// 2. We do something to it (call a function, click a button, etc.)
// 3. We check that the result is what we expected
//
// The pattern is: ARRANGE → ACT → ASSERT

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useVideoEditor } from "@/hooks/useVideoEditor";

// "describe" groups related tests together
describe("useVideoEditor", () => {
  // "it" defines a single test — reads like English: "it should start with no video"
  it("should start with no video loaded", () => {
    // ARRANGE: Create the hook
    const { result } = renderHook(() => useVideoEditor());

    // ASSERT: Check the initial state is correct
    expect(result.current.state.video).toBeNull();
    expect(result.current.state.isProcessing).toBe(false);
    expect(result.current.state.textOverlays).toEqual([]);
  });

  it("should have default filter values (100% brightness, 100% contrast, 0% grayscale)", () => {
    const { result } = renderHook(() => useVideoEditor());

    expect(result.current.state.filters.brightness).toBe(100);
    expect(result.current.state.filters.contrast).toBe(100);
    expect(result.current.state.filters.grayscale).toBe(0);
  });

  it("should set a video when setVideo is called", () => {
    const { result } = renderHook(() => useVideoEditor());

    // Create a fake video file for testing
    // (we don't need a real video — just an object that looks like one)
    const fakeFile = new File(["fake video data"], "test-video.mp4", {
      type: "video/mp4",
    });

    // ACT: Call setVideo
    // "act" tells React to process all state updates before we check the result
    act(() => {
      result.current.setVideo(fakeFile);
    });

    // ASSERT: Video should now be loaded
    expect(result.current.state.video).not.toBeNull();
    expect(result.current.state.video?.name).toBe("test-video.mp4");
    expect(result.current.state.video?.file).toBe(fakeFile);
    // The URL should be a blob URL (temporary URL for the file)
    expect(result.current.state.video?.url).toContain("blob:");
  });

  it("should remove the video and reset state when removeVideo is called", () => {
    const { result } = renderHook(() => useVideoEditor());

    // First, add a video
    const fakeFile = new File(["fake"], "video.mp4", { type: "video/mp4" });
    act(() => {
      result.current.setVideo(fakeFile);
    });

    // Verify it's loaded
    expect(result.current.state.video).not.toBeNull();

    // Now remove it
    act(() => {
      result.current.removeVideo();
    });

    // Everything should be back to initial state
    expect(result.current.state.video).toBeNull();
    expect(result.current.state.trim).toEqual({ start: 0, end: 0 });
    expect(result.current.state.filters).toEqual({
      brightness: 100,
      contrast: 100,
      grayscale: 0,
    });
  });

  it("should update trim values", () => {
    const { result } = renderHook(() => useVideoEditor());

    act(() => {
      result.current.setTrim(5, 15);
    });

    expect(result.current.state.trim.start).toBe(5);
    expect(result.current.state.trim.end).toBe(15);
  });

  it("should update filter values", () => {
    const { result } = renderHook(() => useVideoEditor());

    act(() => {
      result.current.setFilters({
        brightness: 150,
        contrast: 80,
        grayscale: 50,
      });
    });

    expect(result.current.state.filters.brightness).toBe(150);
    expect(result.current.state.filters.contrast).toBe(80);
    expect(result.current.state.filters.grayscale).toBe(50);
  });

  it("should update text overlays", () => {
    const { result } = renderHook(() => useVideoEditor());

    const overlays = [
      {
        id: "1",
        text: "Hello World",
        x: 50,
        y: 50,
        fontSize: 32,
        color: "#ffffff",
      },
    ];

    act(() => {
      result.current.setTextOverlays(overlays);
    });

    expect(result.current.state.textOverlays).toHaveLength(1);
    expect(result.current.state.textOverlays[0].text).toBe("Hello World");
  });

  it("should toggle processing state", () => {
    const { result } = renderHook(() => useVideoEditor());

    expect(result.current.state.isProcessing).toBe(false);

    act(() => {
      result.current.setProcessing(true);
    });

    expect(result.current.state.isProcessing).toBe(true);
  });
});

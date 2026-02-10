import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

const createToolInvocation = (
  toolName: string,
  command: string,
  path: string,
  state: "partial-call" | "call" | "result" = "result",
  additionalArgs: Record<string, any> = {}
) => ({
  toolCallId: "test-id",
  toolName,
  args: { command, path, ...additionalArgs },
  state,
  result: state === "result" ? "Success" : undefined,
});

// Basic Rendering Tests
test("ToolInvocationBadge renders with str_replace_editor tool", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Created Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge renders with file_manager tool", () => {
  const toolInvocation = createToolInvocation("file_manager", "delete", "old.tsx");

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Deleted old\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge applies custom className prop", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "Button.tsx"
  );

  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={toolInvocation}
      className="custom-class"
    />
  );

  const badge = container.querySelector(".custom-class");
  expect(badge).toBeDefined();
});

// str_replace_editor Operations Tests
test("ToolInvocationBadge shows 'Created' message for create command", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "src/components/Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Created Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge shows 'Updated' message for str_replace command", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "str_replace",
    "src/components/Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Updated Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge shows 'Updated' message for insert command", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "insert",
    "src/components/Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Updated Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge shows 'Viewing' message for view command", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "view",
    "src/components/Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Viewing Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge shows 'Reverted' message for undo_edit command", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "undo_edit",
    "src/components/Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Reverted Button\.tsx/)).toBeDefined();
});

// file_manager Operations Tests
test("ToolInvocationBadge shows 'Deleted' message for delete command", () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    "delete",
    "src/components/OldButton.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Deleted OldButton\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge shows 'Renamed' message for rename command", () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    "rename",
    "src/components/Header.tsx",
    "result",
    { new_path: "src/components/Navbar.tsx" }
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(
    screen.getByText(/Renamed Header\.tsx to Navbar\.tsx/)
  ).toBeDefined();
});

// State Handling Tests
test("ToolInvocationBadge shows spinner when state is 'partial-call'", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "Button.tsx",
    "partial-call"
  );

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );

  // Check for spinner (Loader2 icon)
  const spinner = container.querySelector("svg");
  expect(spinner?.className.baseVal).toContain("animate-spin");
});

test("ToolInvocationBadge shows spinner when state is 'call'", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "Button.tsx",
    "call"
  );

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );

  // Check for spinner
  const spinner = container.querySelector("svg");
  expect(spinner?.className.baseVal).toContain("animate-spin");
});

test("ToolInvocationBadge shows operation icon when state is 'result'", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "Button.tsx",
    "result"
  );

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );

  // Check for icon (should have emerald color for completed)
  const icon = container.querySelector("svg");
  expect(icon?.className.baseVal).toContain("text-emerald");
  expect(icon?.className.baseVal).not.toContain("animate-spin");
});

// File Path Display Tests
test("ToolInvocationBadge extracts filename from full path", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "src/components/buttons/Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge shows both filenames for rename operations", () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    "rename",
    "src/components/Header.tsx",
    "result",
    { new_path: "src/components/Navbar.tsx" }
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  const badge = screen.getByText(/Renamed Header\.tsx to Navbar\.tsx/);
  expect(badge.textContent).toContain("Header.tsx");
  expect(badge.textContent).toContain("Navbar.tsx");
});

test("ToolInvocationBadge handles Windows-style paths with backslashes", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "src\\components\\Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge handles root-level files", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "App.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Created App\.tsx/)).toBeDefined();
});

// Error Handling Tests
test("ToolInvocationBadge handles missing args gracefully", () => {
  const toolInvocation = {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: {},
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Edited Unknown file/)).toBeDefined();
});

test("ToolInvocationBadge handles missing path in args", () => {
  const toolInvocation = {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create" },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Created Unknown file/)).toBeDefined();
});

test("ToolInvocationBadge handles missing new_path for rename", () => {
  const toolInvocation = createToolInvocation(
    "file_manager",
    "rename",
    "src/components/Button.tsx"
  );

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  // Should still show rename message without the new path
  expect(screen.getByText(/Renamed Button\.tsx/)).toBeDefined();
});

test("ToolInvocationBadge shows fallback for unknown tool names", () => {
  const toolInvocation = {
    toolCallId: "test-id",
    toolName: "unknown_tool",
    args: { command: "some-command", path: "file.tsx" },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

test("ToolInvocationBadge shows fallback for unknown commands", () => {
  const toolInvocation = {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "unknown_command", path: "Button.tsx" },
    state: "result" as const,
    result: "Success",
  };

  render(<ToolInvocationBadge toolInvocation={toolInvocation} />);

  expect(screen.getByText(/Edited Button\.tsx/)).toBeDefined();
});

// Accessibility Tests
test("ToolInvocationBadge has appropriate aria-label", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "Button.tsx",
    "result"
  );

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );

  const badge = container.querySelector("[role='status'], [aria-label]");
  expect(badge?.getAttribute("aria-label")).toContain("Completed");
  expect(badge?.getAttribute("aria-label")).toContain("Created Button.tsx");
});

test("ToolInvocationBadge has role='status' for in-progress operations", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    "Button.tsx",
    "partial-call"
  );

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );

  const badge = container.querySelector("[role='status']");
  expect(badge).toBeDefined();
  expect(badge?.getAttribute("aria-label")).toContain("In progress");
});

// Tooltip Tests
test("ToolInvocationBadge shows full path in title attribute", () => {
  const fullPath = "src/components/buttons/Button.tsx";
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    "create",
    fullPath
  );

  const { container } = render(
    <ToolInvocationBadge toolInvocation={toolInvocation} />
  );

  const badge = container.querySelector("[title]");
  expect(badge?.getAttribute("title")).toBe(fullPath);
});

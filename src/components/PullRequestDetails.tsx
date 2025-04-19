import { Component } from "solid-js";

interface PullRequestDetailsProps {
  onCancel: () => void;
}

const PullRequestDetails: Component<PullRequestDetailsProps> = (props) => {
  // Retro styles based on TranslationEditor
  const tableStyle = {
    "border": "3px outset rgb(192, 192, 192)",
    "border-collapse": "separate",
    "border-spacing": "2px",
    "background-color": "#efefef", // Light gray background
    "font-family": "Tahoma, Arial, sans-serif",
    "box-shadow": "2px 2px 6px #888888",
    "width": "100%",
    "margin-top": "1rem", // Add some space above
    "margin-bottom": "1rem", // Add some space below
  } as const;
  const thStyle = {
    "background-color": "#0000aa", // Dark blue header
    "color": "white",
    "font-weight": "bold",
    "text-align": "center",
    "padding": "4px",
    "border": "2px outset #c0c0c0",
    "font-size": "medium", // Slightly larger than TranslationEditor's header
  } as const;
  const labelCellStyle = {
    "font-weight": "bold",
    "padding": "6px 12px",
    "border": "2px inset #c0c0c0",
    "background-color": "#d0d0d0", // Medium gray label cell
    "text-align": "right",
    "vertical-align": "top", // Align label to the top
    "width": "150px", // Fixed width for labels
  } as const;
  const inputCellStyle = {
    "padding": "6px",
    "border": "2px inset #c0c0c0",
    "background-color": "#ffffff", // White background for input area
  } as const;
  const inputStyle = { // Basic retro input styling
    "border": "1px solid #888",
    "padding": "4px",
    "width": "100%",
    "background-color": "#ffffff",
    "font-family": "Tahoma, Arial, sans-serif",
  } as const;
  const buttonStyle = {
    "border": "2px outset #c0c0c0",
    "background-color": "#c0c0c0", // Standard gray button background
    "padding": "4px 10px",
    "font-family": "Tahoma, Arial, sans-serif",
    "cursor": "pointer",
    "margin-left": "8px", // Space between buttons
  } as const;
  const disabledButtonStyle = {
    ...buttonStyle,
    "color": "#888888", // Grayed out text
    "cursor": "default",
  } as const;

  // Specific style for the button row cell, derived from inputCellStyle
  const buttonRowCellStyle = {
    ...inputCellStyle,
    "text-align": "right"
  } as const;

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th colSpan={2} style={thStyle}>
            Create Pull Request
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={labelCellStyle}>
            <label for="pr-title">Title:</label>
          </td>
          <td style={inputCellStyle}>
            <input
              type="text"
              id="pr-title"
              style={inputStyle}
              placeholder="Enter PR title..."
            />
          </td>
        </tr>
        <tr>
          <td style={labelCellStyle}>
            <label for="pr-description">Description:</label>
          </td>
          <td style={inputCellStyle}>
            <textarea
              id="pr-description"
              rows="5" // Increased rows slightly
              style={inputStyle}
              placeholder="Enter PR description (optional)..."
            ></textarea>
          </td>
        </tr>
        <tr>
          <td
            colSpan={2}
            style={buttonRowCellStyle} // Use the specific const style object
          >
            <button
              type="button"
              onClick={props.onCancel}
              style={buttonStyle}
            >
              Back to editing
            </button>
            <button
              type="button"
              disabled // Disabled for now
              style={disabledButtonStyle}
            >
              Create PR (Not implemented)
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

export default PullRequestDetails;

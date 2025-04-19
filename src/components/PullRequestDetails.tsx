import { Component } from "solid-js";

interface PullRequestDetailsProps {
  onCancel: () => void;
}

const PullRequestDetails: Component<PullRequestDetailsProps> = (props) => {
  return (
    <div class="border rounded p-4 my-4 bg-gray-50">
      <h2 class="text-xl font-semibold mb-3">Create Pull Request</h2>
      <div class="mb-3">
        <label for="pr-title" class="block text-sm font-medium text-gray-700 mb-1">
          Pull Request Title
        </label>
        <input
          type="text"
          id="pr-title"
          class="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter PR title..."
        />
      </div>
      <div class="mb-4">
        <label for="pr-description" class="block text-sm font-medium text-gray-700 mb-1">
          Pull Request Description
        </label>
        <textarea
          id="pr-description"
          rows="4"
          class="w-full p-2 border rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter PR description (optional)..."
        ></textarea>
      </div>
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          onClick={props.onCancel}
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Back to editing
        </button>
        <button
          type="button"
          disabled // Disabled for now
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Create PR (Not implemented)
        </button>
      </div>
    </div>
  );
};

export default PullRequestDetails;

import React from "react";

export default function ToggleButton({
  showEnglish,
  toggle,
}: {
  showEnglish: boolean;
  toggle: () => void;
}) {
  return (
    <button
      onClick={toggle}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
    >
      {showEnglish ? "日本語で表示" : "英語で表示"}
    </button>
  );
}

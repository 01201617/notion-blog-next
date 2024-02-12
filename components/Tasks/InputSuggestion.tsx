import React, { useState } from "react";

interface Suggestion {
  word: string;
  color: string;
}

type InputSuggestionProps = {
  suggestions: Suggestion[];
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputParams: React.ComponentPropsWithoutRef<"input">;
  tagWhats: string[];
  onChangeTags?: (tags: string[]) => void;
};

const InputSuggestion: React.FC<InputSuggestionProps> = ({
  suggestions,
  handleKeyDown,
  inputParams,
  tagWhats,
  onChangeTags,
}) => {
  const [input, setInput] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    []
  );

  // 入力値が変更された時の処理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // 入力値に基づいて提案をフィルタリング
    const filtered = suggestions.filter((suggestion) =>
      suggestion.word.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredSuggestions(filtered);
  };

  // 入力ボックスにフォーカスされた時の処理
  const handleFocus = () => {
    setFilteredSuggestions(suggestions);
  };

  // 入力候補がクリックされた時の処理
  const handleSuggestionClick = (word: string) => {
    setFilteredSuggestions([]); // 提案リストをクリア
    const newTags = [...tagWhats, word];
    onChangeTags && onChangeTags(newTags);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFilteredSuggestions([]);
    }, 200); // 少し遅延を設ける
  };

  function getContrastYIQ(hexColor: string) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "grey" : "white";
  }

  return (
    <div className="">
      <input
        type="text"
        value={input}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        {...inputParams}
        className="w-full border border-gray-300 p-2 rounded bg-white"
      />
      <ul className="absolute z-10  bg-white shadow-md max-h-60 overflow-y-auto border border-gray-200 mt-1 rounded">
        {filteredSuggestions.map((suggestion, index) => (
          <li
            key={index}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            style={{
              backgroundColor: suggestion.color + "90",
              color: getContrastYIQ(suggestion.color),
            }}
            onClick={() => handleSuggestionClick(suggestion.word)}
          >
            {suggestion.word}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InputSuggestion;

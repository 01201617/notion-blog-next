import React from "react";
import TagsInput from "../Tasks/TagsInput";

interface FilterPanelProps {
  createdFrom: string;
  setCreatedFrom: (val: string) => void;
  createdTo: string;
  setCreatedTo: (val: string) => void;
  lastReadFrom: string;
  setLastReadFrom: (val: string) => void;
  lastReadTo: string;
  setLastReadTo: (val: string) => void;
  readCountFrom: number;
  setReadCountFrom: (val: number) => void;
  readCountTo: number;
  setReadCountTo: (val: number) => void;
  selectedCategories: string[];
  setSelectedCategories: (val: string[]) => void;
  tagKind: string;
  tagWhatListWithColors: { [key: string]: string };
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  createdFrom,
  setCreatedFrom,
  createdTo,
  setCreatedTo,
  lastReadFrom,
  setLastReadFrom,
  lastReadTo,
  setLastReadTo,
  readCountFrom,
  setReadCountFrom,
  readCountTo,
  setReadCountTo,
  selectedCategories,
  setSelectedCategories,
  tagKind,
  tagWhatListWithColors,
}) => {
  return (
    <div className="space-y-4 p-4 border rounded bg-white shadow">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium">登録日（開始）</label>
          <input
            type="month"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">登録日（終了）</label>
          <input
            type="month"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            最終読了日（開始）
          </label>
          <input
            type="month"
            value={lastReadFrom}
            onChange={(e) => setLastReadFrom(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">
            最終読了日（終了）
          </label>
          <input
            type="month"
            value={lastReadTo}
            onChange={(e) => setLastReadTo(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium">読了回数（最小）</label>
          <input
            type="number"
            min={0}
            value={readCountFrom}
            onChange={(e) => setReadCountFrom(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">読了回数（最大）</label>
          <input
            type="number"
            min={0}
            value={readCountTo}
            onChange={(e) => setReadCountTo(Number(e.target.value))}
            className="w-full border rounded px-2 py-1"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">カテゴリ</label>
        <TagsInput
          tagKind={tagKind}
          tagWhats={selectedCategories}
          onChangeTags={setSelectedCategories}
          tagWhatListWithColors={tagWhatListWithColors}
        />
      </div>
    </div>
  );
};

export default FilterPanel;

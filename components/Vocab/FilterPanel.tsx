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
  readCountTo: number | undefined;
  setReadCountTo: (val: number | undefined) => void;
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
  function generateYearMonthOptions(): string[] {
    const options = [];
    const startYear = 2020;
    const endYear = new Date().getFullYear();
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const mm = month.toString().padStart(2, "0");
        options.push(`${year}-${mm}`);
      }
    }
    return options.reverse(); // 新しい年月が上に来るように
  }

  return (
    <div className="space-y-4 p-4 border rounded bg-white shadow">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium">登録年月（開始）</label>
          <select
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">-- 年月を選択 --</option>
            {generateYearMonthOptions().map((ym) => (
              <option key={`createdFrom-${ym}`} value={ym}>
                {ym}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">登録年月（終了）</label>
          <select
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">-- 年月を選択 --</option>
            {generateYearMonthOptions().map((ym) => (
              <option key={`createdTo-${ym}`} value={ym}>
                {ym}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">
            最終読了日（開始）
          </label>
          <select
            value={lastReadFrom}
            onChange={(e) => setLastReadFrom(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">-- 年月を選択 --</option>
            {generateYearMonthOptions().map((ym) => (
              <option key={`lastReadFrom-${ym}`} value={ym}>
                {ym}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">
            最終読了日（終了）
          </label>
          <select
            value={lastReadTo}
            onChange={(e) => setLastReadTo(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            <option value="">-- 年月を選択 --</option>
            {generateYearMonthOptions().map((ym) => (
              <option key={`lastReadTo-${ym}`} value={ym}>
                {ym}
              </option>
            ))}
          </select>
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
            value={readCountTo === undefined ? "" : readCountTo}
            onChange={(e) =>
              setReadCountTo(
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
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

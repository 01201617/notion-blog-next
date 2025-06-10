"use client";

import React, { useRef } from "react";
import ExcelJS from "exceljs";
import { addVocab } from "./firestoreUtils";

const ExcelUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];

    const headerRow = worksheet.getRow(1);
    const headers = headerRow.values as string[];

    const normalize = (str: string) =>
      str.toLowerCase().replace(/[^a-z]/gi, "");

    const headerMap: Record<string, number> = {};

    headers.forEach((header, idx) => {
      if (typeof header !== "string") return;
      const key = normalize(header);
      if (["jpn", "japanese", "answer", "ans", "a"].includes(key)) {
        headerMap.jpn = idx;
      } else if (["eng", "english", "question", "q", "que"].includes(key)) {
        headerMap.eng = idx;
      } else if (["categories", "category", "tag", "tags"].includes(key)) {
        headerMap.categories = idx;
      }
    });

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const jpn =
        row
          .getCell(headerMap.jpn ?? 0)
          .value?.toString()
          .trim() || "";
      const eng =
        row
          .getCell(headerMap.eng ?? 0)
          .value?.toString()
          .trim() || "";
      const categoriesRaw =
        row
          .getCell(headerMap.categories ?? 0)
          .value?.toString()
          .trim() || "";
      const categories = categoriesRaw.split(/[、,\s]+/).filter((s) => s);

      if (!eng || !jpn) continue;

      const remarksParts: string[] = [];
      headers.forEach((header, idx) => {
        if (
          typeof header === "string" &&
          idx !== headerMap.jpn &&
          idx !== headerMap.eng &&
          idx !== headerMap.categories
        ) {
          const cellVal = row.getCell(idx).value?.toString().trim();
          if (cellVal) remarksParts.push(`${header}: ${cellVal}`);
        }
      });

      const remarks = remarksParts.join(" / ");

      await addVocab({
        eng,
        jpn,
        categories,
        remarks,
        isFavorite: false,
      });
    }

    alert("アップロードが完了しました");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-dashed border-2 border-blue-400 p-6 rounded text-center mb-4"
    >
      <p className="mb-2">Excelファイルをドラッグ＆ドロップ、または</p>
      <button
        className="bg-blue-500 text-white px-3 py-1 rounded"
        onClick={() => fileInputRef.current?.click()}
      >
        ファイルを選択
      </button>
      <input
        type="file"
        accept=".xlsx"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default ExcelUploader;

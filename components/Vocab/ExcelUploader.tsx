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

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      const id = row.getCell(1).value?.toString() || "";
      const jpn = row.getCell(2).value?.toString() || "";
      const eng = row.getCell(3).value?.toString() || "";

      if (!eng || !jpn) continue; // 空行スキップ

      await addVocab({
        eng,
        jpn,
        categories: [],
        remarks: `Excel row ${id}`,
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

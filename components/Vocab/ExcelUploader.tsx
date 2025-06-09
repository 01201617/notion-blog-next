"use client";

import React, { useRef } from "react";
import * as XLSX from "xlsx";
import { addVocab } from "./firestoreUtils";

const ExcelUploader = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    for (const row of jsonData) {
      const { 番号, 日本語, 英語 } = row as {
        番号: number;
        日本語: string;
        英語: string;
      };
      await addVocab({
        eng: 英語,
        jpn: 日本語,
        categories: [],
        remarks: `Excel row ${番号}`,
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
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
};

export default ExcelUploader;

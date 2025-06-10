"use client";

import React from "react";

export default function FlipCard({
  front,
  back,
  flipped,
  onClick,
  showEnglish,
  vocabDetails,
  showDetails,
}: {
  front: string;
  back: string;
  flipped: boolean;
  onClick: () => void;
  showEnglish: boolean;
  vocabDetails: {
    remarks: string;
    categories: string[];
    createdAt: any;
    lastReadAt?: any;
    readCount?: number;
  };
  showDetails: boolean;
}) {
  const isShowingEnglish =
    (showEnglish && !flipped) || (!showEnglish && flipped);
  const bgColor = isShowingEnglish ? "bg-pink-100" : "bg-blue-100";

  return (
    <div
      onClick={onClick}
      className={`${bgColor} cursor-pointer border rounded shadow p-4 text-center hover:shadow-lg transition duration-300`}
    >
      <div>{flipped ? back : front}</div>

      {flipped && showDetails && (
        <div className="mt-2 text-sm text-gray-700 text-left">
          {vocabDetails.remarks && <div>📝 {vocabDetails.remarks}</div>}
          {vocabDetails.categories.length > 0 && (
            <div>🏷️ {vocabDetails.categories.join(", ")}</div>
          )}
          {vocabDetails.createdAt?.seconds && (
            <div>
              🗓️ 登録日:{" "}
              {new Date(
                vocabDetails.createdAt.seconds * 1000
              ).toLocaleDateString()}
            </div>
          )}
          {vocabDetails.lastReadAt?.seconds && (
            <div>
              🕓 最終読了:{" "}
              {new Date(
                vocabDetails.lastReadAt.seconds * 1000
              ).toLocaleDateString()}
            </div>
          )}
          <div>📚 読了回数: {vocabDetails.readCount ?? 0}</div>
        </div>
      )}
    </div>
  );
}

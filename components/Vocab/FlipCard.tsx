import React from "react";

export default function FlipCard({
  front,
  back,
  flipped,
  onClick,
  showEnglish,
}: {
  front: string;
  back: string;
  flipped: boolean;
  onClick: () => void;
  showEnglish: boolean;
}) {
  // 表示している言語に応じた背景色
  const isShowingEnglish =
    (showEnglish && !flipped) || (!showEnglish && flipped);
  const bgColor = isShowingEnglish ? "bg-pink-100" : "bg-blue-100";

  return (
    <div
      onClick={onClick}
      className={`${bgColor} cursor-pointer border rounded shadow p-4 text-center hover:shadow-lg transition duration-300`}
    >
      {flipped ? back : front}
    </div>
  );
}

import React from "react";

//大参考: https://dev.to/designly/react-markdown-how-to-create-a-copy-code-button-26cm
export default function CodeCopyBtn({ children }: any) {
  const [copyOk, setCopyOk] = React.useState(false);

  const iconColor = copyOk ? "#0ab0f2" : "#d34c4c";

  const handleClick = (e: any) => {
    navigator.clipboard.writeText(children[0].props.children[0]);
    console.log(children);

    setCopyOk(true);
    setTimeout(() => {
      setCopyOk(false);
    }, 500);
  };

  return (
    <div className="code-copy-btn">
      <button
        onClick={handleClick}
        style={{ color: iconColor, fontSize: "medium" }}
      >
        {copyOk ? "コピ-しました" : "コピー?"}
      </button>
    </div>
  );
}

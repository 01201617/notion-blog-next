import React from "react";
import clsx from "clsx";
import { Badge } from "./Badge";
import InputSuggestion from "./InputSuggestion";
import { auth, db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
//https://zenn.dev/takasy/articles/react-tags-input

type TagsInputProps = React.ComponentPropsWithoutRef<"input"> & {
  isError?: boolean;
  tagWhats: string[];
  tagWhatListWithColors: { [key: string]: string };
  onChangeTags?: (tags: string[]) => void;
};

const styles = {
  default: "border-gray-200 focus:bg-white focus:border-gray-500",
  error: "border-red-500 focus:bg-white focus:border-gray-500",
};

/* eslint @typescript-eslint/no-unused-vars: 0 */
/* eslint react/prop-types: 0 */
export const TagsInput: React.FC<TagsInputProps> = ({
  onChangeTags,
  tagWhats = [],
  tagWhatListWithColors,
  isError,
  className,
  ...props
}) => {
  const suggestions = Object.keys(tagWhatListWithColors).map((tag, index) => ({
    word: tag,
    color: tagWhatListWithColors[tag],
  }));

  const updateTagWhatLists = async (word: string) => {
    await addDoc(collection(db, "tagWhats"), {
      tag: word,
      author: {
        username: auth.currentUser?.displayName,
        id: auth.currentUser?.uid,
      },
    });
  };

  const onClose = (i: number) => {
    const newTags = [...tagWhats];
    newTags.splice(i, 1);
    onChangeTags && onChangeTags(newTags);
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing) return;

    const value = e.currentTarget.value;
    if (
      e.key === "Backspace" &&
      !value.length &&
      Object.values(tagWhatListWithColors).length > 0
    ) {
      onClose(Object.values(tagWhatListWithColors).length - 1);
      return;
    }

    if (e.key !== "Enter" || !value.trim()) return;
    const newTags = [...tagWhats, value];
    onChangeTags && onChangeTags(newTags);
    e.currentTarget.value = "";
    // e.preventDefault();

    if (Object.values(tagWhatListWithColors).includes(value)) {
    } else {
      updateTagWhatLists(value);
    }
  }

  return (
    <div
      className={clsx(
        "flex flex-wrap text-gray-700 border leading-tight pt-3 pb-2 px-4 rounded bg-white",
        styles[isError ? "error" : "default"]
      )}
    >
      {tagWhats.map((tag, i) => {
        return (
          <Badge
            key={i}
            color={
              tagWhatListWithColors[tag]
                ? tagWhatListWithColors[tag]
                : "#868686"
            }
            size="sm"
            className={"mr-1 mb-1"}
            onClose={() => onClose(i)}
          >
            {tag}
          </Badge>
        );
      })}
      <InputSuggestion
        suggestions={suggestions}
        handleKeyDown={handleKeyDown}
        inputParams={props}
        tagWhats={tagWhats}
        onChangeTags={onChangeTags}
      />
    </div>
  );
};

export default TagsInput;

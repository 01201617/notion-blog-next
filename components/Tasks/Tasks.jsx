"use client";
import { collection, addDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { format } from "date-fns";
import TagsInput from "./TagsInput";
import colormap from "colormap";

const Tasks = () => {
  const [taskList, setTaskList] = useState([]);
  const [todo, setTodo] = useState("");
  const [taskDay, setTaskDay] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [tagWhats, setTagWhats] = useState(["入力"]);
  const [tagWhatListWithColors, setTagWhatListWithColors] = useState({});

  const createTask = async () => {
    await addDoc(collection(db, "tasks"), {
      todo: todo,
      taskDay: taskDay,
      startAt: startAt,
      endAt: endAt,
      createdAt: new Date(),
      categories: [""],
      tags: tagWhats,
      author: {
        username: auth.currentUser.displayName,
        id: auth.currentUser.uid,
      },
    });
    setTodo("");
    setTaskDay(taskDay);
    setStartAt(endAt);
    setEndAt("");
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const calculateTimeDifference = (time1, time2) => {
    const minutes1 = timeToMinutes(time1);
    const minutes2 = timeToMinutes(time2);

    return Math.abs(minutes1 - minutes2);
  };

  const sortTasks = (taskList) => {
    const userTasks = taskList.filter((task) => {
      return task.author?.id === auth.currentUser?.uid;
    });

    const tasksWithTime = userTasks.map((task) => {
      let yyyyMMdd = "";
      if (task.taskDay !== undefined && task.taskDay !== "") {
        yyyyMMdd = format(task.taskDay, "yyyyMMdd");
      } else {
        yyyyMMdd = format(task.createdAt.toDate(), "yyyyMMdd");
      }
      const time = task.startAt.split(":")[0] + task.startAt.split(":")[1];
      const fullTime = yyyyMMdd + time;
      const year = parseInt(fullTime.substring(0, 4));
      const month = parseInt(fullTime.substring(4, 6)) - 1;
      const date = parseInt(fullTime.substring(6, 8));
      const hour = parseInt(fullTime.substring(8, 10));
      const min = parseInt(fullTime.substring(10, 12));
      const fullTimeDate = new Date(year, month, date, hour, min);

      return { ...task, fullTime: fullTime, fullTimeDate: fullTimeDate };
    });

    const sortedTasks = tasksWithTime.sort((a, b) => {
      return a.fullTime > b.fullTime ? 1 : -1;
    });

    const today = new Date();
    const resentTasks = sortedTasks.filter((task) => {
      const diffMilliSec = today - task.fullTimeDate;
      const diffDays = parseInt(diffMilliSec / 1000 / 60 / 60 / 24);
      return diffDays <= 2 && diffDays >= 0;
    });
    if (resentTasks[resentTasks.length - 1].taskDay) {
      setTaskDay(resentTasks[resentTasks.length - 1].taskDay);
    } else {
      const formattedDate = today.toISOString().split("T")[0];
      setTaskDay(formattedDate);
    }

    setStartAt(resentTasks[resentTasks.length - 1].endAt);
    const resentTags = resentTasks[resentTasks.length - 1].tags;
    if (resentTags && resentTags[0] !== "") {
      setTagWhats(resentTags);
    }

    return resentTasks;
  };
  const getTasks = async () => {
    const data = await getDocs(collection(db, "tasks"));
    const taskList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setTaskList(sortTasks(taskList));
  };

  const getTagWhatLists = async () => {
    const data = await getDocs(collection(db, "tagWhats"));
    const collectionTagWhats = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const tagWhatLists = collectionTagWhats
      .filter((document) => document.author?.id === auth.currentUser?.uid)
      .map((document) => document.tag);
    const colorSize = tagWhatLists.length > 5 ? tagWhatLists.length : 6;
    const colors = colormap({
      colormap: "jet",
      nshades: colorSize,
      format: "hex",
      alpha: 0.5,
    });
    const tagColors = tagWhatLists.reduce((obj, tag, index) => {
      obj[tag] = colors[index];
      return obj;
    }, {});
    setTagWhatListWithColors(tagColors);
  };

  function getContrastYIQ(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#969696" : "white";
  }

  useEffect(() => {
    getTasks();
    getTagWhatLists();
  }, []);

  return (
    <>
      <input
        type="text"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        placeholder="タスク"
        required
      />
      <input
        type="date"
        value={taskDay}
        onChange={(e) => setTaskDay(e.target.value)}
        required
      />
      <input
        type="time"
        value={startAt}
        onChange={(e) => setStartAt(e.target.value)}
        required
      />
      <input
        type="time"
        value={endAt}
        onChange={(e) => setEndAt(e.target.value)}
        required
      />
      <div>
        <TagsInput
          // tagWhatLists={Object.keys(tagWhatListWithColors)}
          tagWhats={tagWhats}
          tagWhatListWithColors={tagWhatListWithColors}
          // tagColors={Object.values(tagWhatListWithColors)}
          onChangeTags={(newTags) => {
            setTagWhats(newTags);
          }}
        />
      </div>
      <button
        className="bg-green-500 hover:bg-green-400 text-white rounded px-4 py-2"
        onClick={() => {
          createTask();
          getTasks();
        }}
      >
        task追加
      </button>
      <h2 className="my-10">Taskを表示↓</h2>
      {taskList.map((task, index) => {
        return (
          <div key={index}>
            {task.author?.id === auth.currentUser?.uid && (
              <div key={task.id} className="flex container m-auto">
                <div className="w-72 mr-2">{task.todo}</div>
                <div className="w-20 mr-2">
                  {task.fullTime.substring(4, 6) +
                    "/" +
                    task.fullTime.substring(6, 8)}
                </div>
                <div className="w-40 mr-3">
                  {task.startAt + "-" + task.endAt}
                </div>
                {task.startAt && (
                  <div className="w-20 mr-3">{`${calculateTimeDifference(
                    task.startAt,
                    task.endAt
                  )} 分`}</div>
                )}
                {task.categories && (
                  <div>
                    {task.categories.map((category) => (
                      <div key={category}>{category}</div>
                    ))}
                  </div>
                )}
                {task.tags && (
                  <div className="flex container flex-wrap h-3">
                    {task.tags.map((tag) => (
                      <div
                        style={{
                          backgroundColor: tagWhatListWithColors[tag]
                            ? tagWhatListWithColors[tag] + "90"
                            : "#868686" + "90",
                          color: getContrastYIQ(
                            tagWhatListWithColors[tag]
                              ? tagWhatListWithColors[tag]
                              : "#FFFFFF"
                          ),
                        }}
                        key={tag}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

export default Tasks;

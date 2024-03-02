"use client";
import { collection, addDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { format, subDays, parseISO } from "date-fns";
import TagsInput from "./TagsInput";
import colormap from "colormap";
import { AnalysisChart } from "./AnalysisChart";

const Tasks = () => {
  const [taskList, setTaskList] = useState([]);
  const [taskAnalysis, setTaskAnalysis] = useState([]);
  const [todo, setTodo] = useState("");
  const [taskDay, setTaskDay] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [tagWhats, setTagWhats] = useState(["What"]);
  const [tagWhos, setTagWhos] = useState(["Who"]);
  const [tagWheres, setTagWheres] = useState(["Where"]);
  const [tagWhatListWithColors, setTagWhatListWithColors] = useState({});
  const [tagWhoListWithColors, setTagWhoListWithColors] = useState({});
  const [tagWhereListWithColors, setTagWhereListWithColors] = useState({});
  const today = new Date();
  const [accountStartDay, setAccountStartDay] = useState(
    format(subDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [accountEndDay, setAccountEndDay] = useState(
    format(today, "yyyy-MM-dd")
  );
  const [analysisStartDay, setAnalysisStartDay] = useState(
    format(subDays(new Date(), 3), "yyyy-MM-dd")
  );
  const [analysisEndDay, setAnalysisEndDay] = useState(
    format(today, "yyyy-MM-dd")
  );
  const [dayUnit, setDayUnit] = useState(1);

  const createTask = async () => {
    if (isNaN(calculateTimeDifference(startAt, endAt))) {
    } else {
      await addDoc(collection(db, "tasks"), {
        todo: todo,
        taskDay: taskDay,
        startAt: startAt,
        endAt: endAt,
        createdAt: new Date(),
        categories: [""],
        tags: tagWhats,
        tagWhos: tagWhos,
        tagWheres: tagWheres,
        author: {
          username: auth.currentUser.displayName,
          id: auth.currentUser.uid,
        },
      });
      setTodo("");
      setTaskDay(taskDay);
      setStartAt(endAt);
      setEndAt("");
    }
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

  const sortTasks = (taskList, startDay, endDay) => {
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

    const resentTasks = sortedTasks.filter((task) => {
      const diffMilliSecFromStart = parseISO(startDay) - task.fullTimeDate;
      const diffDaysFromStart = parseInt(
        diffMilliSecFromStart / 1000 / 60 / 60 / 24
      );
      const diffMilliSecFromEnd = parseISO(endDay) - task.fullTimeDate;
      const diffDaysFromEnd = parseInt(
        diffMilliSecFromEnd / 1000 / 60 / 60 / 24
      );
      return diffDaysFromStart <= 0 && diffDaysFromEnd >= 0;
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

    const resentTagWhos = resentTasks[resentTasks.length - 1].tagWhos;
    if (resentTagWhos && resentTagWhos[0] !== "") {
      setTagWhos(resentTagWhos);
    }

    const resentTagWheres = resentTasks[resentTasks.length - 1].tagWheres;
    if (resentTagWheres && resentTagWheres[0] !== "") {
      setTagWheres(resentTagWheres);
    }

    return resentTasks;
  };
  const getTaskList = async () => {
    const data = await getDocs(collection(db, "tasks"));
    const taskList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setTaskList(sortTasks(taskList, accountStartDay, accountEndDay));
  };
  const getTaskAnalysis = async () => {
    const data = await getDocs(collection(db, "tasks"));
    const taskList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    setTaskAnalysis(sortTasks(taskList, analysisStartDay, analysisEndDay));
  };

  const getTagLists = async (tagKind) => {
    const data = await getDocs(collection(db, tagKind));
    const collectionTags = data.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    const tagLists = collectionTags
      .filter((document) => document.author?.id === auth.currentUser?.uid)
      .map((document) => document.tag);
    const colorSize = tagLists.length > 5 ? tagLists.length : 6;
    const colors = colormap({
      colormap: "jet",
      nshades: colorSize,
      format: "hex",
      alpha: 0.5,
    });
    const tagColors = tagLists.reduce((obj, tag, index) => {
      obj[tag] = colors[index];
      return obj;
    }, {});
    if (tagKind === "tagWhats") {
      setTagWhatListWithColors(tagColors);
    } else if (tagKind === "tagWhos") {
      setTagWhoListWithColors(tagColors);
    } else if (tagKind === "tagWheres") {
      setTagWhereListWithColors(tagColors);
    }
  };

  function getContrastYIQ(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "#969696" : "white";
  }

  useEffect(() => {
    getTaskList();
    getTagLists("tagWhats");
    getTagLists("tagWhos");
    getTagLists("tagWheres");
  }, [accountStartDay, accountEndDay]);

  useEffect(() => {
    getTaskAnalysis();
  }, [analysisStartDay, analysisEndDay]);

  return (
    <>
      <input
        className="h-10 w-48 mb-1"
        type="text"
        value={todo}
        onChange={(e) => setTodo(e.target.value)}
        placeholder="タスク"
        required
      />
      <div className="flex">
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
      </div>
      <div>
        <TagsInput
          tagKind={"tagWhats"}
          tagWhats={tagWhats}
          tagWhatListWithColors={tagWhatListWithColors}
          onChangeTags={(newTags) => {
            setTagWhats(newTags);
          }}
        />
      </div>
      <div>
        <TagsInput
          tagKind={"tagWhos"}
          tagWhats={tagWhos}
          tagWhatListWithColors={tagWhoListWithColors}
          onChangeTags={(newTags) => {
            setTagWhos(newTags);
          }}
        />
      </div>
      <div>
        <TagsInput
          tagKind={"tagWheres"}
          tagWhats={tagWheres}
          tagWhatListWithColors={tagWhereListWithColors}
          onChangeTags={(newTags) => {
            setTagWheres(newTags);
          }}
        />
      </div>

      <button
        className="bg-green-500 hover:bg-green-400 text-white rounded px-4 py-2"
        onClick={() => {
          createTask();
          getTaskList();
        }}
      >
        task追加
      </button>
      <h2 className="my-10">Taskを表示↓</h2>
      <div className="flex">
        <p className="text-gray-500 bg-slate-100">開始日</p>
        <input
          type="date"
          value={accountStartDay}
          onChange={(e) => setAccountStartDay(e.target.value)}
          required
        />
      </div>
      <div className="flex mb-2">
        <p className="text-gray-500 bg-slate-100">終了日</p>
        <input
          type="date"
          value={accountEndDay}
          onChange={(e) => setAccountEndDay(e.target.value)}
          required
        />
      </div>
      {taskList.map((task, index, array) => {
        return (
          <div key={index}>
            {task.author?.id === auth.currentUser?.uid && (
              <div>
                {index > 0 &&
                  array[index - 1].fullTime.substring(4, 8) !==
                    task.fullTime.substring(4, 8) && (
                    <hr className="border my-4 border-gray-200" />
                  )}
                <div key={task.id} className="flex w-full">
                  <div className="w-full mr-2">{task.todo}</div>
                  <div className="w-20 mr-2">
                    {task.fullTime.substring(4, 6) +
                      "/" +
                      task.fullTime.substring(6, 8)}
                  </div>
                  <div className="w-64 mr-2">
                    {task.startAt + "-" + task.endAt}
                  </div>
                  {task.startAt && (
                    <div className="w-32 mr-2">{`${calculateTimeDifference(
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
                  <div className="flex container flex-wrap h-3  justify-between">
                    {task.tags && (
                      <div className="flex">
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
                    {task.tagWhos && (
                      <div className="flex">
                        {task.tagWhos.map((tag) => (
                          <div
                            style={{
                              backgroundColor: tagWhoListWithColors[tag]
                                ? tagWhoListWithColors[tag] + "90"
                                : "#868686" + "90",
                              color: getContrastYIQ(
                                tagWhoListWithColors[tag]
                                  ? tagWhoListWithColors[tag]
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
                    {task.tagWheres && (
                      <div className="flex">
                        {task.tagWheres.map((tag) => (
                          <div
                            style={{
                              backgroundColor: tagWhereListWithColors[tag]
                                ? tagWhereListWithColors[tag] + "90"
                                : "#868686" + "90",
                              color: getContrastYIQ(
                                tagWhereListWithColors[tag]
                                  ? tagWhereListWithColors[tag]
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
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div className="flex mt-5">
        <p className="text-gray-500 bg-slate-100">開始日</p>
        <input
          type="date"
          value={analysisStartDay}
          onChange={(e) => setAnalysisStartDay(e.target.value)}
          required
        />
      </div>
      <div className="flex">
        <p className="text-gray-500 bg-slate-100">終了日</p>
        <input
          type="date"
          value={analysisEndDay}
          onChange={(e) => setAnalysisEndDay(e.target.value)}
          required
        />
      </div>
      <div className="flex">
        <p className="text-gray-500 bg-slate-100">まとめ日数</p>
        <input
          className="w-10"
          type="number"
          value={dayUnit}
          onChange={(e) => setDayUnit(parseInt(e.target.value))}
          required
        />
      </div>

      <AnalysisChart
        taskList={taskAnalysis}
        dayUnit={dayUnit}
        tagWhatListWithColors={tagWhatListWithColors}
      />
    </>
  );
};

export default Tasks;

"use client";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { format, subDays, parseISO } from "date-fns";
import TagsInput from "./TagsInput";
import colormap from "colormap";
import { AnalysisChart } from "./AnalysisChart";
import CustomCalendar from "./CustomCalendar";
import { async } from "@firebase/util";

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
  const [checkedIds, setCheckedIds] = useState([]);
  const [checkedRenewIds, setCheckedRenewId] = useState();
  const [referringDay, setReferringDay] = useState(
    format(subDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [copyDay, setCopyDay] = useState(format(today, "yyyy-MM-dd"));

  const changeLocalTime = async () => {
    const docRef = doc(db, "tasksUpdateTime", "1");
    const docSnap = await getDoc(docRef);
    const firebaseTaskUpdateTime = docSnap.data().updatedAt.toDate().getTime();
    localStorage.setItem("updateTime", firebaseTaskUpdateTime);
  };

  const createTask = async () => {
    if (isNaN(calculateTimeDifference(startAt, endAt))) {
    } else {
      const task = {
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
      };
      await addDoc(collection(db, "tasks"), task);
      //ローカル保存変数も更新
      const localTasks = JSON.parse(localStorage.getItem("tasks"));
      const newTask = { ...task, id: "dummy" };
      localTasks.push(newTask);
      localStorage.setItem("tasks", JSON.stringify(localTasks));
      changeLocalTime();

      setTodo("");
      setTaskDay(taskDay);
      setStartAt(endAt);
      setEndAt("");
    }
  };

  const handleCreateTask = async () => {
    await createTask();
    await getTaskList();
  };

  const createTasks = async (tasks, copyDay) => {
    for (const task of tasks) {
      if (!isNaN(calculateTimeDifference(task.startAt, task.endAt))) {
        await addDoc(collection(db, "tasks"), {
          todo: task.todo,
          taskDay: copyDay,
          startAt: task.startAt,
          endAt: task.endAt,
          createdAt: new Date(),
          categories: [""],
          tags: task.tags || [],
          tagWhos: task.tagWhos || [],
          tagWheres: task.tagWheres || [],
          author: {
            username: task.author.username,
            id: task.author.id,
          },
        });
      }
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
    const userTasks = taskList
      .filter((task) => {
        return task.author?.id === auth.currentUser?.uid;
      })
      .filter((task) => {
        const hasStartAt = task.startAt !== undefined;

        let date;
        if (task.createdAt) {
          if (typeof task.createdAt.toDate === "function") {
            // createdAtがFirebase Timestampオブジェクトである場合
            date = task.createdAt.toDate();
          } else if (task.createdAt.seconds) {
            // createdAtが {nanoseconds: 865000000, seconds: 1708950922} の形式である場合
            date = new Date(task.createdAt.seconds * 1000);
          } else if (
            typeof task.createdAt === "string" ||
            typeof task.createdAt === "number"
          ) {
            // createdAtが文字列または数値（タイムスタンプ）の場合
            date = new Date(task.createdAt);
          }
        }

        const hasValidCreatedAt = date instanceof Date && !isNaN(date);

        return hasStartAt && hasValidCreatedAt;
      });

    const tasksWithTime = userTasks.map((task) => {
      let taskDate;

      // FirebaseのTimestampからDateオブジェクトを生成
      if (typeof task.createdAt.toDate === "function") {
        taskDate = task.createdAt.toDate();
      }
      // {nanoseconds: xxx, seconds: xxx}形式からDateオブジェクトを生成
      else if (task.createdAt.seconds) {
        taskDate = new Date(task.createdAt.seconds * 1000);
        // }
        // // ISO 8601形式の日付文字列からDateオブジェクトを生成
        // else if (typeof task.createdAt === "string") {
        //   taskDate = new Date(task.createdAt);
        // }
        // // 既にDateオブジェクトの場合
        // else if (task.createdAt instanceof Date) {
        //   taskDate = task.createdAt;
      }
      // 予期せぬ形式の場合、現在の日付を使用
      else {
        taskDate = new Date();
      }

      // Dateオブジェクトを指定したフォーマットに変換
      const yyyyMMdd = format(taskDate, "yyyyMMdd");
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

    if (resentTasks.length === 0) {
      return resentTasks;
    }

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
    const localTasks = localStorage.getItem("tasks");
    const localTaskUpdateTime = Number(localStorage.getItem("updateTime"));
    const docRef = doc(db, "tasksUpdateTime", "1");
    const docSnap = await getDoc(docRef);
    const firebaseTaskUpdateTime = docSnap.data().updatedAt.toDate().getTime();
    if (localTasks && localTaskUpdateTime === firebaseTaskUpdateTime) {
      setTaskList(
        sortTasks(JSON.parse(localTasks), accountStartDay, accountEndDay)
      );
    } else {
      const data = await getDocs(collection(db, "tasks"));
      const taskList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      if (taskList.length > 0) {
        localStorage.setItem("tasks", JSON.stringify(taskList));
        localStorage.setItem("updateTime", firebaseTaskUpdateTime);
        setTaskList(sortTasks(taskList, accountStartDay, accountEndDay));
      }
    }
  };
  const getTaskAnalysis = async () => {
    const localTasks = localStorage.getItem("tasks");
    const localTaskUpdateTime = Number(localStorage.getItem("updateTime"));
    const docRef = doc(db, "tasksUpdateTime", "1");
    const docSnap = await getDoc(docRef);
    const firebaseTaskUpdateTime = docSnap.data().updatedAt.toDate().getTime();
    if (localTasks && localTaskUpdateTime === firebaseTaskUpdateTime) {
      setTaskAnalysis(
        sortTasks(JSON.parse(localTasks), analysisStartDay, analysisEndDay)
      );
    } else {
      const data = await getDocs(collection(db, "tasks"));
      const taskList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      if (taskList.length > 0) {
        localStorage.setItem("tasks", JSON.stringify(taskList));
        localStorage.setItem("updateTime", firebaseTaskUpdateTime);
        setTaskAnalysis(sortTasks(taskList, analysisStartDay, analysisEndDay));
      }
    }
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

  // チェックボックスの状態を管理する関数
  const handleCheckboxChange = (id) => {
    setCheckedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 選択されたタスクを削除する関数
  const deleteSelectedTasks = async () => {
    if (window.confirm("選択したタスクを削除しますか？")) {
      await Promise.all(
        checkedIds.map((id) => {
          const taskDoc = doc(db, "tasks", id);
          return deleteDoc(taskDoc);
        })
      );
      getTaskList();
      setCheckedIds([]);
    }
  };

  const handleCopyList = (task) => {
    setTodo(task.todo);
    setTaskDay(task.taskDay);
    setStartAt(task.startAt);
    setEndAt(task.endAt);
    setTagWhats(task.tags);
    setTagWheres(task.tagWheres);
    setTagWhos(task.tagWhos);
    setCheckedRenewId(task.id);
  };

  // タスクを更新する関数
  const updateTask = async () => {
    const taskDocRef = doc(db, "tasks", checkedRenewIds);
    try {
      await updateDoc(taskDocRef, {
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
      getTaskList();
      setTodo("");
      setTaskDay(taskDay);
      setStartAt(endAt);
      setEndAt("");
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const getTasksOnSpecificDay = (specificDay) => {
    const tasksOnSpecificDay = taskList.filter((task) => {
      return (
        parseInt(task.fullTime.substring(0, 4)) ===
          parseInt(specificDay.substring(0, 4)) &&
        parseInt(task.fullTime.substring(4, 6)) ===
          parseInt(specificDay.substring(5, 7)) &&
        parseInt(task.fullTime.substring(6, 8)) ===
          parseInt(specificDay.substring(8, 10))
      );
    });
    return tasksOnSpecificDay;
  };

  const copyTasks = () => {
    const copyTasks = getTasksOnSpecificDay(copyDay);
    let isConfirmed = true;
    if (copyTasks.length > 0) {
      isConfirmed = confirm("既にデータがあります。コピーしてもいいですか？");
    }
    if (isConfirmed === false) {
      return;
    }
    const referringTasks = getTasksOnSpecificDay(referringDay);
    createTasks(referringTasks, copyDay);
  };

  const initialize = () => {
    getTaskList();
    getTagLists("tagWhats");
    getTagLists("tagWhos");
    getTagLists("tagWheres");
  };

  const fetchTaskList = async () => {
    const data = await getDocs(collection(db, "tasks"));
    const taskList = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    const docRef = doc(db, "tasksUpdateTime", "1");
    const docSnap = await getDoc(docRef);
    const firebaseTaskUpdateTime = docSnap.data().updatedAt.toDate().getTime();
    if (taskList.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(taskList));
      localStorage.setItem("updateTime", firebaseTaskUpdateTime);
      setTaskList(sortTasks(taskList, accountStartDay, accountEndDay));
      setTaskAnalysis(sortTasks(taskList, analysisStartDay, analysisEndDay));
    }
  };

  useEffect(() => {
    initialize();
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
        className="bg-green-500 hover:bg-green-400 text-white rounded mx-2 px-4 py-2"
        onClick={() => {
          handleCreateTask();
        }}
      >
        task追加
      </button>
      <button
        className="bg-cyan-300 hover:bg-cyan-100 text-white rounded mx-2  px-4 py-2"
        onClick={() => {
          updateTask();
        }}
      >
        task修正
      </button>
      <button
        className="bg-slate-400 hover:slate-200 text-white rounded mx-2 px-4 py-2"
        onClick={deleteSelectedTasks}
      >
        選択したタスクを削除
      </button>
      <div className="flex">
        <p className="text-gray-500 bg-slate-100">コピー元(日)</p>
        <input
          type="date"
          value={referringDay}
          onChange={(e) => setReferringDay(e.target.value)}
          required
        />
        <p className="text-gray-500 bg-slate-100">コピー先(日)</p>
        <input
          type="date"
          value={copyDay}
          onChange={(e) => setCopyDay(e.target.value)}
          required
        />
        <button
          className="bg-green-500 hover:bg-green-400 text-white rounded mx-2 px-4 py-2"
          onClick={() => {
            copyTasks();
            getTaskList();
          }}
        >
          task1日分コピー
        </button>
      </div>
      <h2 className="my-10">Taskを表示↓</h2>
      <button
        className="bg-slate-400 hover:slate-200 text-white rounded mx-2 px-4 py-2"
        onClick={fetchTaskList}
      >
        リストを更新(DBと同期)
      </button>
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
      {taskList &&
        taskList.map((task, index, array) => {
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
                    <input
                      className="w-10"
                      type="checkbox"
                      checked={checkedIds.includes(task.id)}
                      onChange={() => handleCheckboxChange(task.id)}
                    />
                    <button
                      className="bg-cyan-300 hover:bg-cyan-100 text-white rounded mx-2  px-2 py-2"
                      onClick={() => handleCopyList(task)}
                    >
                      &rarr;
                    </button>
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
      <div className="container mx-auto">
        <CustomCalendar
          taskList={taskAnalysis}
          tagWhatListWithColors={tagWhatListWithColors}
        />
      </div>
    </>
  );
};

export default Tasks;

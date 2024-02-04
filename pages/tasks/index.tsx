"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Login from "../../components/Tasks/Login";
import Logout from "../../components/Tasks/Logout";
import Tasks from "../../components/Tasks/Tasks";

const TaskPage = () => {
  const [isAuth, setIsAuth] = useState(false);
  useEffect(() => {
    setIsAuth(Boolean(localStorage.getItem("isAuth")));
  }, []);
  //   const [isAuth, setIsAuth] = useState(false);
  return (
    <>
      {!isAuth ? (
        <Login setIsAuth={setIsAuth} />
      ) : (
        <>
          <div>タスク登録と本日・機能分の表示</div>
          <Tasks />

          <Logout setIsAuth={setIsAuth} />
        </>
      )}
    </>
  );
};

export default TaskPage;

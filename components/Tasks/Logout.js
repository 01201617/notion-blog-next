import { signOut } from "firebase/auth";
import React from "react";
import { auth } from "./firebase";
import { useRouter } from "next/navigation";

const Logout = ({ setIsAuth }) => {
  const router = useRouter();
  const logout = () => {
    //ログアウト
    signOut(auth).then(() => {
      localStorage.clear();
      setIsAuth(false);
      router.push("/tasks");
    });
  };
  return (
    <div>
      <p>ログアウトする</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
};

export default Logout;

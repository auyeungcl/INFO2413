import React from "react";
import { Link } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { auth } from "../../utils/FirebaseAuth";
import { useAuthState } from "react-firebase-hooks/auth";
import { adminAccountId } from "../../utils/Constants";
import AdminDashboard from "./AdminDashboard";
import EmployeeDashboard from "./EmployeeDashboard";
import GardenerDashboard from "./GardenerDashboard";

import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../../utils/FirebaseLink";
import { collection } from "firebase/firestore";

const Dashboard = () => {
  const [user, loading, error] = useAuthState(auth);

  const [userAccountList] = useCollection(collection(db, "AccountDetails"));

  const getAccountDoc = (uid) => {
    let doc = "";
    userAccountList.forEach((element) => {
      if (element.id === uid) {
        doc = element.data();
      }
    });
    return doc;
  };

  if (!user) return <Navigate to="/login" />;
  if (user.uid === adminAccountId) return <AdminDashboard />;
  if (userAccountList && getAccountDoc(user.uid).accountType === "Employee") {
    return <EmployeeDashboard displayName={getAccountDoc(user.uid).name} />;
  }
  if (userAccountList && getAccountDoc(user.uid).accountType === "Gardener")
    return <GardenerDashboard displayName={getAccountDoc(user.uid).name} user={user} />;

  // else return <GardenerDashboard />;
  // return <>{user.uid === adminAccountId ? <AdminDashboard /> : <h1>User page</h1>}</>;
  return <></>;
};

export default Dashboard;

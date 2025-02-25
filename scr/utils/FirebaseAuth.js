import { getAuth, signInWithEmailAndPassword, updatePassword, onAuthStateChanged, signOut } from "firebase/auth";
import { firebaseApp } from "./FirebaseLink";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "react-toastify";

export const auth = getAuth();

export function updateUserPassword(newPassword, setSubmitting, resetForm) {
  updatePassword(auth.currentUser, newPassword)
    .then(() => {
      toast.success("Account updated successfully");
      setSubmitting(false);
      resetForm();
    })
    .catch((error) => {
      toast.error(error.message);
      setSubmitting(false);
    });
}

export function testSeedQuantity() {
  const functions = getFunctions();
  const testSeedQuantity = httpsCallable(functions, "checkSeedQuantities");
  return testSeedQuantity();
}

export function deleteUser(uid, accountType) {
  const functions = getFunctions();
  const deleteUser = httpsCallable(functions, "deleteUser");
  console.log(deleteUser({ uid, accountType }));
}

export function listAllUsers(setterCallBack) {
  const functions = getFunctions();
  const listUsers = httpsCallable(functions, "listAllUsers");

  // listUsers()
  //   .then((result) => {
  //     console.log(result);
  //     setterCallBack(result);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //   });

  toast.promise(listUsers, {
    pending: {
      render() {
        return "Loading...";
      },
    },
    success: {
      render(result) {
        console.log(typeof result.data.data);
        setterCallBack(result.data);
        return "Users Loaded";
      },
    },
    error: {
      render(error) {
        return "Error Loading";
      },
    },
  });
}

export function login(email, password, toast) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userObj) => {
      const user = userObj.user;
      console.log(user);
    })
    .catch((error) => {
      toast.error(error.message);
    });
}

export function logout() {
  return signOut(auth);
}

export function register(email, password, name, accountType, callBack, setterCallBack, resetCallBack) {
  // firebaseApp.functions()
  //   .httpsCallable("register")({ email, password, name, accountType })
  //   .then((result) => {
  //     console.log(result);
  //   });
  const functions = getFunctions();
  const addUser = httpsCallable(functions, "register");
  addUser({ email, password, name, accountType })
    .then((result) => {
      console.log("Rsult ", result);
      callBack(false);
      setterCallBack(result.data);
      resetCallBack();
    })
    .catch((error) => {
      callBack(false);
      setterCallBack(error.message);
      resetCallBack();
    });
}

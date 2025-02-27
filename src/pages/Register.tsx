import React, { useState } from "react";
import "../styles/login.css";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { useLocation } from "react-router-dom";
import Loading, { LargeLoad } from "../components/Loading";

function randomCode() {
  return Math.random().toString().substring(2, 8);
}

const Register = () => {
  const [err, setErr] = useState<string | null>(null);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [isPass, setIsPass] = useState(true);
  const [isLoadGoogle, setIsLoadGoogle] = useState<boolean>(false);
  const pathName = useLocation()?.search;

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;
    const username = e.currentTarget.username.value;

    try {
      setIsLoad(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Menyimpan data user ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        username: username,
        email: user.email,
        reffCode: randomCode(),
        inviteFrom: pathName?.split("=").pop() || null,
        invitings: [],
        avatar:
          "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
      });

      if (pathName?.split("=").pop()) {
        const q = query(
          collection(db, "users"),
          where("reffCode", "==", pathName?.split("=").pop())
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (document) => {
            const userDoc = doc(db, "users", document.id);
            await updateDoc(userDoc, {
              invitings: [...document?.data()?.invitings, user?.uid],
            });
          });
        }
      }

      localStorage.setItem("user", user.uid);
      window.location.href = "/dashboard";
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error signing up: ", error);
        setErr(error.message);
      }
    } finally {
      setIsLoad(false);
    }
  };

  const handleLoginGoogle = async () => {
    setIsLoadGoogle(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);

      const existingUser = await getDoc(doc(db, "users", user.uid));
      if (!existingUser.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          username: user.displayName,
          email: user.email,
          reffCode: randomCode(),
          inviteFrom: pathName?.split("=").pop() || null,
          invitings: [],
          avatar:
            user?.photoURL ||
            "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
        });
      }

      if (pathName?.split("=").pop()) {
        const q = query(
          collection(db, "users"),
          where("reffCode", "==", pathName?.split("=").pop())
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach(async (document) => {
            const userDoc = doc(db, "users", document.id);
            await updateDoc(userDoc, {
              invitings: [...document?.data()?.invitings, user?.uid],
            });
          });
        }
      }

      localStorage.setItem("user", user.uid);
      window.location.href = "/dashboard";
    } catch (error) {
      if (error instanceof Error) {
        setErr("Google login failed");
        setIsLoadGoogle(false);
      }
    } finally {
      setIsLoadGoogle(false);
    }
  };

  return (
    <section className="container forms">
      {isLoadGoogle && <LargeLoad />}
      <div className="form login">
        <div className="form-content">
          <header>Register</header>
          <div className="w-50 mx-auto">
            <img src="/logo-bursa.jpeg" alt="" className="w-100" />
          </div>
          <form onSubmit={handleSignUp}>
            {err && (
              <div className="d-flex justify-content-center">
                <span
                  style={{
                    color: "red",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {err?.slice(10)}
                </span>
              </div>
            )}
            <div className="field input-field">
              <input
                required
                type="email"
                placeholder="Email"
                className="input"
                name="email"
              />
            </div>
            <div className="field input-field">
              <input
                required
                type="text"
                placeholder="Username ex: John21"
                name="username"
                className="input"
              />
            </div>
            <div className="field input-field">
              <input
                required
                type={isPass ? "password" : "text"}
                placeholder="Password"
                className="password"
                name="password"
              />
              {isPass ? (
                <i
                  onClick={() => setIsPass(!isPass)}
                  className="fa-solid fa-eye eye-icon"
                ></i>
              ) : (
                <i
                  onClick={() => setIsPass(!isPass)}
                  className="fa-solid fa-eye-slash eye-icon"
                ></i>
              )}
            </div>
            <div className="form-link">
              <a href="/forgot-password" className="forgot-pass">
                Forgot password?
              </a>
            </div>
            <div className="field button-field">
              <button
                type="submit"
                disabled={isLoad}
                style={{ opacity: isLoad ? 0.5 : 1 }}
              >
                {isLoad ? <Loading /> : "Register"}
              </button>
            </div>
          </form>
          <div className="form-link">
            <span>
              Already have an account?{" "}
              <a href="/login" className="link signup-link">
                Login
              </a>
            </span>
          </div>
        </div>
        <div className="line"></div>
        <div className="media-options">
          <a
            onClick={handleLoginGoogle}
            className="field google"
            style={{ cursor: "pointer" }}
          >
            <img src="/google.png" alt="" className="google-img" />
            <span>Login with Google</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Register;

import React, { FormEvent, useState } from "react";
import "../styles/login.css";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "../lib/firebase";
import Loading, { LargeLoad } from "../components/Loading";
import { doc, getDoc, setDoc } from "firebase/firestore";

function randomCode() {
  return Math.random().toString().substring(2, 8);
}

const Login = () => {
  const [isPass, setIsPass] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [isLoad, setIsLoad] = useState<boolean>(false);
  const [isLoadGoogle, setIsLoadGoogle] = useState<boolean>(false);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = e.currentTarget.email.value;
    const password = e.currentTarget.password.value;

    setIsLoad(true);
    setErr("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      localStorage.setItem("user", userCredential.user.uid);
      window.location.href = "/dashboard";
    } catch (error) {
      if (error instanceof Error) {
        setErr(error.message.slice(10));
        console.error("Error signing in: ", error);
        setIsLoad(false);
      }
    } finally {
      setIsLoad(false);
    }
  };

  const handleLoginGoogle = async () => {
    try {
      setIsLoadGoogle(true);
      setErr("");
      const { user } = await signInWithPopup(auth, googleProvider);

      const existingUser = await getDoc(doc(db, "users", user.uid));
      if (!existingUser.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          id: user.uid,
          username: user.displayName,
          email: user.email,
          reffCode: randomCode(),
          inviteFrom: null,
          avatar:
            user?.photoURL ||
            "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg",
        });
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
          <header>Login</header>
          <div className="w-50 mx-auto">
            <img src="/logo-bursa.jpeg" alt="" className="w-100" />
          </div>
          <form onSubmit={handleSignIn}>
            {err && (
              <div className="d-flex justify-content-center">
                <span
                  style={{
                    color: "red",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  {err}
                </span>
              </div>
            )}
            <div className="field input-field">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="input"
                required
              />
            </div>
            <div className="field input-field">
              <input
                type={isPass ? "password" : "text"}
                placeholder="Password"
                className="password"
                name="password"
                required
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
                {isLoad ? <Loading /> : "Login"}
              </button>
            </div>
          </form>
          <div className="form-link">
            <span>
              Don't have an account?{" "}
              <a href="/register" className="link signup-link">
                Signup
              </a>
            </span>
          </div>
        </div>
        <div className="line"></div>
        <div className="media-options">
          <a
            onClick={handleLoginGoogle}
            style={{ cursor: "pointer" }}
            className="field google cursor-pointer"
          >
            <img src="/google.png" alt="" className="google-img" />
            <span>Login with Google</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Login;

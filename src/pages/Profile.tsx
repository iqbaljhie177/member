import React, {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import Sidebar from "../components/Sidebar/SIdebar";
import "../styles/profile.css";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { auth, db, storage } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import Loading from "../components/Loading";
import { toast } from "react-toastify";
import { sendPasswordResetEmail } from "firebase/auth";

const Profile = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState<string | undefined>("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [country, setCountry] = useState<string | undefined>("");
  const [address, setAddress] = useState<string | undefined>("");
  const [socialMedia, setSocialMedia] = useState<string | undefined>("");
  const [avatar, setAvatar] = useState<string | undefined>("");
  const [prevAvatar, setPrevAvatar] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoad, setIsLoad] = useState(false);
  const [isLoadUpdate, setIsLoadUpdate] = useState(false);
  const notify = () => toast("update success..", { type: "success" });
  const [sendEmail, setSendEmail] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      setUsername(user?.username);
      setEmail(user?.email);
      setAddress(user?.address);
      setPhone(user?.phone);
      setCountry(user?.country);
      setSocialMedia(user?.socialMedia);
      setAvatar(user?.avatar);
    }
  }, [user]);

  const handleLoadPrevAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];

    if (files) {
      setFile(files);
      const reader = new FileReader();
      reader.onload = () => {
        setPrevAvatar(reader.result as string);
      };
      reader.readAsDataURL(files);
    }
  };

  const handleUpload = () => {
    if (file) {
      setIsLoad(true);
      const storageRef = ref(storage, `profile/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        },
        (error) => {
          console.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(doc(db, "users", user?.id as string), {
              avatar: downloadURL,
            }).then(() => {
              notify();
              setIsLoad(false);
            });
          });
        }
      );
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoadUpdate(true);

    try {
      await updateDoc(doc(db, "users", user?.id as string), {
        username: username ? username : null,
        email: email ? email : null,
        phone: phone ? phone : null,
        address: address ? address : null,
        socialMedia: socialMedia ? socialMedia : null,
        country: country ? country : null,
      });
      notify();
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  const handlePasswordReset = async () => {
    try {
      setSendEmail(true);
      await sendPasswordResetEmail(auth, user?.email!);
      toast("Password reset email sent", { type: "success" });
    } catch (err) {
      console.log(err);
    } finally {
      setSendEmail(false);
    }
  };

  return (
    <Sidebar>
      <div className="cons">
        <div className="card p-2">
          <div className="card-body">
            <div className="row">
              <div className="col-md-10 d-flex gap-3">
                <div>
                  <div
                    className="position-relative parent-avatar"
                    style={{
                      overflow: "hidden",
                      borderRadius: "100%",
                    }}
                  >
                    <img
                      src={prevAvatar ? prevAvatar : avatar}
                      alt="Profile"
                      style={{ width: "100%", height: "100%" }}
                    />
                    <div
                      className="position-absolute z-2 input-file"
                      style={{ opacity: 0 }}
                    >
                      <input type="file" onChange={handleLoadPrevAvatar} />
                    </div>
                    <div
                      className="position-absolute z-1 input-file"
                      style={{
                        paddingLeft: "35px",
                        background: "#0000008c",
                        width: "100%",
                      }}
                    >
                      <i
                        style={{ color: "white" }}
                        className="fa-solid fa-pen"
                      ></i>
                    </div>
                    {isLoad && (
                      <div
                        className="position-absolute z-3 input-file"
                        style={{
                          background: "#0000008c",
                          width: "100%",
                        }}
                      >
                        <Loading />
                      </div>
                    )}
                  </div>
                  {file && (
                    <div onClick={handleUpload} className="btn btn-link">
                      Update
                    </div>
                  )}
                </div>
                <div className="form-group w-100">
                  <label htmlFor="name">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {sendEmail ? (
                    <div className="bg-primary" style={{ width: "100px" }}>
                      <Loading />
                    </div>
                  ) : (
                    <div onClick={handlePasswordReset} className="btn btn-link">
                      Reset Pasword
                    </div>
                  )}
                </div>
              </div>
            </div>
            {!user?.isVerify ? (
              <div className="alert alert-info my-3" role="alert">
                Let's do your verification. Get access to all features with
                complete verification, or try limited service with verification
                fast.
                <Link to={"/dashboard/verify"}>
                  <button className="btn btn-link">Verification now</button>
                </Link>
              </div>
            ) : user?.isVerify === "process" ? (
              <div className="alert alert-warning my-3" role="alert">
                We are processing your KYC verification
              </div>
            ) : user?.isVerify === "failed" ? (
              <div className="alert alert-warning my-3" role="alert">
                Your KYC verification failed, because the data is unclear
                <br />
                <Link to={"/dashboard/verify"}>
                  <button className="btn btn-link">try again now</button>
                </Link>
              </div>
            ) : null}
            <div className="mt-4">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="number"
                  className="form-control"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  readOnly={user?.country ? true : false}
                  type="text"
                  className="form-control"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">Alamat</label>
                <input
                  type="text"
                  className="form-control"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="socialMedia">Media sosial</label>
                <input
                  type="text"
                  className="form-control"
                  id="socialMedia"
                  value={socialMedia}
                  onChange={(e) => setSocialMedia(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleUpdateProfile}
            type="button"
            className="btn btn-update btn-primary"
          >
            {isLoadUpdate ? <Loading /> : "Update"}
          </button>
        </div>
      </div>
    </Sidebar>
  );
};

export default Profile;

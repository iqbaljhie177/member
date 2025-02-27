import { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/SIdebar";
import { AuthContext } from "../components/AuthProvider";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import Loading from "../components/Loading";

interface LatestDataType {
  userId: string;
  time: any;
  type: string;
  link: string;
  detail: string;
}

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [lastActivity, setLasActivity] = useState<LatestDataType[]>([]);
  const [load, setLoad] = useState(true);
  const [isCopy, setIsCopy] = useState(false);

  const getLatestData = async () => {
    try {
      // Membuat query untuk mendapatkan dokumen terbaru dari "deposit" berdasarkan userId
      const depositRef = collection(db, "deposit");
      const depositQuery = query(
        depositRef,
        where("userId", "==", user?.id),
        limit(2)
      );
      const depositSnapshot = await getDocs(depositQuery);

      // Membuat query untuk mendapatkan dokumen terbaru dari "withdraw" berdasarkan userId
      const withdrawRef = collection(db, "withdraw");
      const withdrawQuery = query(
        withdrawRef,
        where("userId", "==", user?.id),
        limit(2)
      );
      const withdrawSnapshot = await getDocs(withdrawQuery);

      depositSnapshot.forEach((doc) => {
        setLasActivity((prev) => [
          ...prev,
          {
            userId: doc.data()?.userId,
            type: doc.data()?.type,
            detail: "$ " + doc.data()?.amount,
            time: doc.data()?.timestamp?.toDate()?.toDateString(),
            link: "/dashboard/transactions/deposit",
          },
        ]);
      });

      withdrawSnapshot.forEach((doc) => {
        setLasActivity((prev) => [
          ...prev,
          {
            userId: doc.data()?.userId,
            type: doc.data()?.type,
            detail: "$ " + doc.data()?.amount,
            time: doc.data()?.timestamp?.toDate()?.toDateString(),
            link: "/dashboard/transactions",
          },
        ]);
      });
    } catch (error) {
      console.error("Error getting documents: ", error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (user) {
      getLatestData();
    }
  }, [user]);

  return (
    <Sidebar>
      <div className="d-flex justify-content-center">
        <div
          className="d-flex flex-column"
          style={{ maxWidth: "600px", paddingBottom: "50px" }}
        >
          {!user?.isVerify && (
            <div className="alert alert-info text-center">
              <strong>Welcome!</strong> Please complete your verification to
              access all features.
              <Link to="/dashboard/verify">
                <button className="btn btn-primary ml-3">Verify Now</button>
              </Link>
            </div>
          )}

          <div className="card w-100">
            <div className="card-header">
              <h3 className="card-title">Dashboard</h3>
            </div>
            <div className="card-body">
              <h4>
                Welcome <span className="text-danger">{user?.username}</span>
              </h4>
              <p>To Trading Area</p>
              <p>Saldo</p>
              <h2>${user?.balance || 0}</h2>
              <div
                className=" d-flex justify-content-between gap-3 mb-4"
                role="group"
              >
                <div className="d-flex gap-2">
                  <Link to={"/dashboard/transactions/deposit"}>
                    <button className="btn rounded-sm btn-warning">
                      Deposit
                    </button>
                  </Link>
                  <Link to={"/dashboard/transactions"}>
                    <button className="btn rounded-sm btn-success">
                      Withdraw
                    </button>
                  </Link>
                </div>
                <Link to={"/dashboard/trading"}>
                  <button className="btn rounded-sm btn-primary">
                    Trading
                  </button>
                </Link>
              </div>
              <strong style={{ marginTop: "24px" }}>Refferal Link</strong>
              <div className="d-flex mb-3 w-100">
                <input
                  value={`${window.location.origin}/register?friend=${user?.reffCode}`}
                  type="text"
                  className="form-control border border-primary text-primary"
                  style={{
                    fontSize: "12px",
                    color: "#333",
                    width: "70%",
                  }}
                  readOnly
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/register?friend=${user?.reffCode}`
                    );
                    setIsCopy(true);

                    setTimeout(() => {
                      setIsCopy(false);
                    }, 5000);
                  }}
                  className={
                    isCopy ? "btn btn-primary" : "btn btn-outline-primary"
                  }
                  style={{ fontSize: "14px", width: "30%" }}
                >
                  {isCopy ? "Copied" : "Copy"}
                </button>
              </div>
              <table className="table">
                <tbody>
                  <tr>
                    <td>Server</td>
                    <td>Bursa Malaysia</td>
                  </tr>
                  <tr>
                    <td>Leverage</td>
                    <td>1:200</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* <div className="card mb-4 w-100 mt-3">
            <div className="card-header">
              <h4 className="card-title">Last Activity</h4>
            </div>
            <div className="card-body">
              {load ? (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#eee",
                    padding: "20px",
                    borderRadius: "12px",
                  }}
                >
                  <Loading />
                </div>
              ) : (
                <ul className="list-group">
                  {lastActivity?.map((actv, idx) => (
                    <Link to={actv?.link} key={idx}>
                      <li
                        className="list-group-item d-flex justify-content-between"
                        style={{ cursor: "pointer" }}
                      >
                        <div>
                          <span
                            className="fw-bold"
                            style={{ fontSize: "14px" }}
                          >
                            {actv?.type}:{" "}
                          </span>
                          <span style={{ fontSize: "14px" }}>
                            {actv?.detail}
                          </span>
                        </div>
                        <div style={{ fontSize: "12px" }}>{actv?.time}</div>
                      </li>
                    </Link>
                  ))}
                </ul>
              )}
            </div>
          </div> */}
        </div>
      </div>
    </Sidebar>
  );
};

export default Dashboard;

import React, { useContext, useEffect, useState } from "react";
import "../styles/Transactions.css";
import Sidebar from "../components/Sidebar/SIdebar";
import { AuthContext } from "../components/AuthProvider";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

interface NotificationType {
  id: string;
  title: string;
  detail: string;
  userId: string;
  timestamp: any;
}

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [load, setLoad] = useState(true);
  const [notifs, setNotifs] = useState<NotificationType[]>([]);

  const getNotifications = async () => {
    try {
      const notifSnapshot = await getDocs(
        query(collection(db, "notifications"), where("userId", "==", user?.id!))
      );
      const notif = notifSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as NotificationType[];
      setNotifs(notif);
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (user) {
      getNotifications();
    }
  }, [user]);

  return (
    <Sidebar>
      <div style={{ padding: "12px" }}>
        <h3 className="ml-5">Notifications:</h3>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Notifications History</h5>
            <div className="mb-3 d-flex flex-wrap justify-content-between gap-2">
              <div>
                <div className="badge bg-info text-dark">User</div>
                <div>{user?.username}</div>
              </div>
            </div>
            {/* <div className="d-flex flex-wrap gap-2">
              <select className="form-select mb-3">
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="lastWeek">Last Week</option>
                <option value="lastMonth">Last Mont</option>
                <option value="lastYear">Last Year</option>
              </select>
            </div> */}
            {load ? (
              <div
                style={{ background: "#eee" }}
                className="d-flex justify-content-center p-5"
              >
                <div className="large-custom-loader"></div>
              </div>
            ) : !load && !notifs ? (
              <div className="text-center">
                <span>No transactions here yet.</span>
              </div>
            ) : (
              <div style={{ overflowX: "scroll" }}>
                <History notifications={notifs} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default Notifications;

const History = ({ notifications }: { notifications: NotificationType[] }) => {
  return (
    <table className="table table-striped" style={{ minWidth: "1000px" }}>
      <thead>
        <tr>
          <th>No</th>
          <th>Title</th>
          <th>Detail</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {notifications.map((notification, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{notification.title}</td>
            <td>{notification.detail}</td>
            <td>{notification.timestamp?.toDate()?.toDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

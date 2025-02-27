import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar/SIdebar";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { AuthContext } from "../components/AuthProvider";
import Loading from "../components/Loading";

interface TradingType {
  id: string;
  amount: number;
  time: string;
  createdAt: any;
  userId: string;
  username: string;
}

const Trading = () => {
  const [amount, setAmount] = useState("");
  const [load, setLoad] = useState(false);
  const [selectedValue, setSelectedValue] = useState("");
  const { user } = useContext(AuthContext);
  const [tradingData, setTradingData] = useState<TradingType[]>([]);

  const handleSelectChange = (e) => {
    setSelectedValue(e.target.value);
  };

  const createDeposit = async () => {
    if (user?.balance < parseInt(amount)) {
      alert("Your balance is not enough");
      return;
    }
    if (!selectedValue || !amount) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoad(true);
      await addDoc(collection(db, "trading"), {
        amount: parseInt(amount),
        time: selectedValue,
        createdAt: serverTimestamp(),
        userId: user?.id,
        username: user?.username,
      })
        .then((data) => {
          if (data.id) {
            getNotifications();
          }
        })
        .then(async () => {
          await updateDoc(doc(db, "users", user?.id), {
            balance: user?.balance - parseInt(amount),
          });
        });

      window.location.reload();
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  const getNotifications = async () => {
    try {
      const notifSnapshot = await getDocs(
        query(collection(db, "trading"), where("userId", "==", user?.id!))
      );
      const notif = notifSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TradingType[];
      setTradingData(notif);
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
      <div
        className="d-flex flex-column align-items-center"
        style={{ width: "100%", paddingBottom: "50px" }}
      >
        <div className="card w-100">
          <div className="card-header">
            <h3 className="card-title">Trading</h3>
            <iframe
              src="https://lighthearted-narwhal-80283a.netlify.app/"
              width={"100%"}
              height={"400px"}
              scrolling={"no"}
            ></iframe>
          </div>
          <div className="my-5 d-flex text-white gap-3 pb-5 flex-wrap">
            <div className="p-2 w-100 rounded-md d-flex border border-white bg-secondary">
              <h3 className="pr-2 border-right border-white">USD</h3>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount min $10"
                className="form-control disabled-opacity-50 w-100 px-2 rounded-md bg-secondary border-0"
              />
            </div>
            <select
              required
              value={selectedValue}
              onChange={handleSelectChange}
              className="form-select p-2 w-100 bg-secondary rounded-lg"
            >
              <option value="" disabled>
                Time
              </option>
              <option value="30 SECONDS">30 SECONDS</option>
              <option value="10 Minutes">10 Minutes</option>
              <option value="1 Hour">1 Hour</option>
              <option value="4 Hours">4 Hours</option>
              <option value="1 Day">1 Day</option>
              <option value="1 Week">1 Week</option>
              <option value="1 Month">1 Month</option>
            </select>
            <button
              onClick={createDeposit}
              className="btn btn-success p-3 w-25 rounded-lg text-white"
            >
              {load ? <Loading /> : "Buy"}
            </button>
          </div>

          <table className="table table-striped" style={{ minWidth: "1000px" }}>
            <thead>
              <tr>
                <th>No</th>
                <th>Username</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {tradingData.map((notification, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{notification.username}</td>
                  <td>${notification.amount}</td>
                  <td>{notification.time}</td>
                  <td>{notification.createdAt?.toDate()?.toDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Sidebar>
  );
};

export default Trading;

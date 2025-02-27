import React, { FormEvent, useContext, useEffect, useState } from "react";
import "../styles/Transactions.css";
import Sidebar from "../components/Sidebar/SIdebar";
import { Link } from "react-router-dom";
import { AuthContext } from "../components/AuthProvider";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import Modal from "react-responsive-modal";
import Loading from "../components/Loading";

interface TransactionsType {
  id: string;
  type: string;
  amount: string;
  imageUrl: string;
  paymentMethod: string;
  createdAt: any;
  status: "process" | "success" | "failed";
}

const Transactions = () => {
  const { user } = useContext(AuthContext);
  const [load, setLoad] = useState(true);
  const [load2, setLoad2] = useState(false);
  const [transactions, setTransactions] = useState<TransactionsType[]>([]);
  const [open, setOpen] = useState(false);
  const [filterTrans, setFilterTrans] = useState("All");

  const getTransactions = async () => {
    try {
      const depositSnapshot = await getDocs(
        query(collection(db, "deposit"), where("userId", "==", user?.id!))
      );
      const withdrawSnapshot = await getDocs(
        query(collection(db, "withdraw"), where("userId", "==", user?.id!))
      );

      const deposit = depositSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "deposit",
        ...doc.data(),
      })) as TransactionsType[];

      const withdraw = withdrawSnapshot.docs.map((doc) => ({
        id: doc.id,
        type: "withdraw",
        ...doc.data(),
      })) as TransactionsType[];
      setTransactions([...deposit, ...withdraw]);
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (user) {
      getTransactions();
    }
  }, [user]);

  useEffect(() => {
    if (filterTrans === "All") {
      getTransactions();
    } else if (filterTrans === "Deposit") {
      setTransactions(transactions.filter((trans) => trans.type === "deposit"));
    } else if (filterTrans === "Withdraw") {
      setTransactions(
        transactions.filter((trans) => trans.type === "withdraw")
      );
    } else if (filterTrans === "Process") {
      setTransactions(
        transactions.filter((trans) => trans.status === "process")
      );
    } else if (filterTrans === "Success") {
      setTransactions(
        transactions.filter((trans) => trans.status === "success")
      );
    } else if (filterTrans === "Failed") {
      setTransactions(
        transactions.filter((trans) => trans.status === "failed")
      );
    }
  }, [filterTrans]);

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  const createWithdraw = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoad2(true);
      const nameOfBank = e.currentTarget?.bank?.value;
      const accountName = e.currentTarget?.accountName?.value;
      const accountNumber = e.currentTarget?.accountNumber?.value;
      const amount = e.currentTarget?.amount?.value;

      await addDoc(collection(db, "withdraw"), {
        paymentMethod: nameOfBank,
        accountName,
        accountNumber,
        amount: parseInt(amount),
        createdAt: serverTimestamp(),
        status: "process",
        userId: user?.id,
        username: user?.username,
      }).then((data) => {
        if (data.id) {
          window.location.reload();
        }
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoad2(false);
    }
  };

  return (
    <Sidebar>
      <div style={{ padding: "12px" }}>
        <h3 className="ml-5">Transactions:</h3>
        <div className="d-flex justify-content-evenly mb-3">
          <Link to={"/dashboard/transactions/deposit"}>
            <button className="btn btn-light text-primary shadow">
              <i style={{ fontSize: "24px" }} className="fas fa-wallet"></i>
              <span className="ms-2">Deposit</span>
            </button>
          </Link>
          <button
            onClick={onOpenModal}
            className="btn btn-light text-success shadow"
          >
            <i
              style={{ fontSize: "24px" }}
              className="fa-solid fa-money-bill-transfer"
            ></i>
            <span className="ms-2">Withdraw</span>
          </button>
        </div>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Transaction History</h5>
            <div className="mb-3 d-flex flex-wrap justify-content-between gap-2">
              <div>
                <div className="badge bg-info text-dark">User</div>
                <div>{user?.username}</div>
              </div>
              <span
                className="float-end"
                style={{ fontSize: "20px", fontWeight: "bold" }}
              >
                US${user?.balance || 0}
              </span>
            </div>
            <div className="d-flex flex-column gap-2">
              {/* <select className="form-select mb-3">
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="lastWeek">Last Week</option>
                <option value="lastMonth">Last Mont</option>
                <option value="lastYear">Last Year</option>
              </select> */}
              <div className="btn-group" role="group">
                <button
                  onClick={() => setFilterTrans("All")}
                  type="button"
                  className={
                    filterTrans === "All"
                      ? "btn btn-primary"
                      : "btn btn-outline-primary"
                  }
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTrans("Deposit")}
                  type="button"
                  className={
                    filterTrans === "Deposit"
                      ? "btn btn-primary"
                      : "btn btn-outline-primary"
                  }
                >
                  Deposit
                </button>
                <button
                  onClick={() => setFilterTrans("Withdraw")}
                  type="button"
                  className={
                    filterTrans === "Withdraw"
                      ? "btn btn-primary"
                      : "btn btn-outline-primary"
                  }
                >
                  Withdraw
                </button>
              </div>
              <div className="btn-group mb-3" role="group">
                <button
                  onClick={() => setFilterTrans("All")}
                  type="button"
                  className={
                    filterTrans === "All"
                      ? "btn btn-success"
                      : "btn btn-outline-success"
                  }
                >
                  All
                </button>
                <button
                  onClick={() => setFilterTrans("Process")}
                  type="button"
                  className={
                    filterTrans === "Process"
                      ? "btn btn-success"
                      : "btn btn-outline-success"
                  }
                >
                  Process
                </button>
                <button
                  onClick={() => setFilterTrans("Success")}
                  type="button"
                  className={
                    filterTrans === "Success"
                      ? "btn btn-success"
                      : "btn btn-outline-success"
                  }
                >
                  Success
                </button>
                <button
                  onClick={() => setFilterTrans("Failed")}
                  type="button"
                  className="btn btn-outline-success"
                >
                  Failed
                </button>
              </div>
            </div>
            {load ? (
              <div
                style={{ background: "#eee" }}
                className="d-flex justify-content-center p-5"
              >
                <div className="large-custom-loader"></div>
              </div>
            ) : !load && !transactions ? (
              <div className="text-center">
                <span>No transactions here yet.</span>
              </div>
            ) : (
              <div style={{ overflowX: "scroll" }}>
                <History data={transactions} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Modal
        open={open}
        onClose={onCloseModal}
        center
        styles={{
          modal: {
            width: window?.innerWidth > 768 ? "500px" : "87%",
          },
        }}
      >
        <h3>Withdraw</h3>
        <form onSubmit={createWithdraw}>
          <label>Bank:</label>
          <input
            required
            className="form-control"
            placeholder="Example: MAYBANK or CIMB BANK"
            style={{ marginBottom: "16px" }}
            name="bank"
          />
          <label>Account Name:</label>
          <input
            required
            className="form-control"
            placeholder="Example: John Doe"
            style={{ marginBottom: "16px" }}
            name="accountName"
          />
          <label>Account Number:</label>
          <input
            required
            className="form-control"
            placeholder="Example: 8765 3763 8273"
            style={{ marginBottom: "16px" }}
            name="accountNumber"
          />
          <label>Amount:</label>
          <input
            required
            className="form-control"
            placeholder="Example: 100"
            style={{ marginBottom: "16px" }}
            type="number"
            name="amount"
          />

          <div className="mt-4 mb-2 d-flex justify-content-between">
            <button
              onClick={onCloseModal}
              type="button"
              className="btn btn-danger"
            >
              CANCEL
            </button>
            <button type="submit" className="btn btn-primary">
              {load2 ? <Loading /> : "SUBMIT"}
            </button>
          </div>
        </form>
      </Modal>
    </Sidebar>
  );
};

export default Transactions;

const History = ({ data }: { data: TransactionsType[] }) => {
  return (
    <table className="table table-striped" style={{ minWidth: "1000px" }}>
      <thead>
        <tr>
          <th>No</th>
          <th>Type</th>
          <th>Amount</th>
          <th>Payment Method</th>
          <th>Status</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{item.type}</td>
            <td>${item.amount}</td>
            <td>{item.paymentMethod}</td>
            <td>{item.status}</td>
            <td>{item.createdAt?.toDate()?.toDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

import React, {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import Sidebar from "../components/Sidebar/SIdebar";
import "../styles/Deposi.css";
import Modal from "react-responsive-modal";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../lib/firebase";
import Loading from "../components/Loading";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { AuthContext } from "../components/AuthProvider";
import { toast } from "react-toastify";

interface PaymentMethodType {
  id?: string;
  nameOfBank?: string;
  logo?: string;
  accountNumber?: string;
  accountName?: string;
  limit?: string;
  comission?: string;
  averageTime?: string;
}

const Deposit = () => {
  const [paymentsMethod, setPaymentsMethod] = useState<PaymentMethodType[]>([]);
  const [loadMounted, setLoadMounted] = useState(true);

  const getPaymentsMethod = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "paymentMethods"));
      const dataList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PaymentMethodType[];
      setPaymentsMethod(dataList);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadMounted(false);
    }
  };

  useEffect(() => {
    getPaymentsMethod();
  }, []);

  return (
    <Sidebar>
      <div style={{ padding: "12px" }}>
        <h4 className="ml-5">Deposit payment method:</h4>
        {loadMounted ? (
          <div className="d-flex justify-content-center m-3">
            <div className="large-custom-loader"></div>
          </div>
        ) : (
          <div className="row mt-5">
            {paymentsMethod.map((item) => (
              <div className="col-md-6 col-lg-3">
                <DetailModal props={item}>
                  <div className="card mb-4">
                    <div className="card-body">
                      <div className="d-flex flex-column">
                        <img
                          src={item?.logo}
                          alt=""
                          className="w-100 mb-3"
                          style={{
                            height: "50px",
                            objectFit: "contain",
                          }}
                        />
                        <h5 className="mb-3">{item?.nameOfBank}</h5>
                      </div>
                      <p className="mb-1">
                        <strong>Commission:</strong> {item?.comission}
                      </p>
                      <p className="mb-1">
                        <strong>Average Time:</strong> {item?.averageTime}
                      </p>
                      <p className="mb-1">
                        <strong>Limit:</strong> {item?.limit}
                      </p>
                    </div>
                  </div>
                </DetailModal>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default Deposit;

function DetailModal({
  children,
  props,
}: {
  children: React.ReactNode;
  props: PaymentMethodType;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [load, setLoad] = useState(false);
  const [loadSubmit, setLoadSubmit] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isCopy, setIsCopy] = useState(false);
  const { user } = useContext(AuthContext);

  const onOpenModal = () => setOpen(true);
  const onCloseModal = () => setOpen(false);

  const handleCreateDepo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoadSubmit(true);
      await addDoc(collection(db, "deposit"), {
        userId: user?.id,
        username: user?.username,
        image: imageUrl,
        paymentMethod: props?.nameOfBank,
        createdAt: serverTimestamp(),
        status: "process",
        amount: parseInt(e.currentTarget?.amount?.value),
      });
      toast("Deposit Will be processed", { type: "success" });
      onCloseModal();
    } catch (error) {
      console.log(error);
    } finally {
      setLoadSubmit(false);
    }
  };

  const handleLoadPrevAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];

    if (files) {
      setFile(files);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(files);
    }
  };

  const handleUpload = () => {
    if (file) {
      setLoad(true);
      const storageRef = ref(storage, `deposit/${file.name}`);
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
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUrl(downloadURL);
            setLoad(false);
            setFile(null);
            setPreview("");
            toast("Upload was successful", { type: "success" });
          });
        }
      );
    }
  };

  return (
    <div>
      <div style={{ cursor: "pointer" }} onClick={onOpenModal}>
        {children}
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
        <h3>Deposit</h3>
        <form onSubmit={handleCreateDepo}>
          <div className="mb-2">
            <strong>Payment Method: </strong>
            {props?.nameOfBank}
          </div>
          <div className="mb-2">
            <strong>Account Name: </strong>
            {props?.accountName}
          </div>
          <div className="mb-2">
            <strong>Account Number: </strong>
            {props?.accountNumber}{" "}
            <span
              onClick={async () => {
                await navigator.clipboard.writeText(`${props?.accountNumber}`);
                setIsCopy(true);

                setTimeout(() => {
                  setIsCopy(false);
                }, 5000);
              }}
              className="mx-2"
              style={{ cursor: "pointer" }}
            >
              {isCopy ? (
                <i className="fa-solid fa-copy"></i>
              ) : (
                <i className="fa-regular fa-copy"></i>
              )}
            </span>
          </div>
          <div className="mb-2">
            <strong>Amount: </strong>
            <input
              type="number"
              placeholder="Ex: 100"
              className="form-control"
              required
              name="amount"
            />
          </div>
          <div className="mb-2">
            <strong>Proof of Payment: </strong>
            <div
              style={{
                width: "130px",
                height: "200px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <img
                src={imageUrl ? imageUrl : preview}
                className="w-100"
                alt=""
                style={{ height: "100%", objectFit: "cover" }}
              />
              <input
                className="form-control form-control-sm w-100 position-absolute"
                style={{ bottom: 0, left: 0 }}
                id="formFileSm"
                type="file"
                onChange={handleLoadPrevAvatar}
              ></input>
            </div>
            {preview && (
              <>
                <button
                  type="button"
                  onClick={handleUpload}
                  className="btn mt-2"
                  style={{
                    background: "orange",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                  }}
                >
                  {load ? <Loading /> : "Upload"}
                </button>
                <p
                  className="text-danger"
                  style={{ fontWeight: "bold", fontSize: "12px" }}
                >
                  *First upload the image and then submit the form
                </p>
              </>
            )}
          </div>
          <div className="mt-4 mb-2 d-flex justify-content-between">
            <button
              onClick={onCloseModal}
              type="button"
              className="btn btn-danger"
            >
              CANCEL
            </button>
            <button
              type="submit"
              style={{ opacity: !imageUrl ? 0.5 : 1 }}
              disabled={!imageUrl ? true : false}
              className="btn btn-primary"
            >
              {loadSubmit ? <Loading /> : "SUBMIT"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// src/VerificationForm.js
import React, { ChangeEvent, useContext, useEffect, useState } from "react";
import "../../styles/Verifications.css";
import Sidebar from "../Sidebar/SIdebar";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import Loading, { LargeLoad } from "../Loading";
import WebcamComponent from "./Video";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { AuthContext } from "../AuthProvider";

export interface KycType {
  code: string;
  name: string;
  flag: string;
  idCardUrl?: string;
  videoVerifyUrl?: string;
}

const VerificationForm = () => {
  const [countries, setCountries] = useState<KycType[]>([
    { code: "MY", name: "Malaysia", flag: "https://flagcdn.com/my.svg" },
    { code: "BN", name: "Brunei", flag: "https://flagcdn.com/bn.svg" },
    { code: "KH", name: "Cambodia", flag: "https://flagcdn.com/kh.svg" },
    { code: "ID", name: "Indonesia", flag: "https://flagcdn.com/id.svg" },
    { code: "LA", name: "Laos", flag: "https://flagcdn.com/la.svg" },
    { code: "MM", name: "Myanmar", flag: "https://flagcdn.com/mm.svg" },
    { code: "PH", name: "Philippines", flag: "https://flagcdn.com/ph.svg" },
    { code: "SG", name: "Singapore", flag: "https://flagcdn.com/sg.svg" },
    { code: "TH", name: "Thailand", flag: "https://flagcdn.com/th.svg" },
    { code: "TL", name: "Timor-Leste", flag: "https://flagcdn.com/tl.svg" },
    { code: "VN", name: "Vietnam", flag: "https://flagcdn.com/vn.svg" },
  ]);
  const [width, setWidth] = useState(25);
  const [kycData, setKycData] = useState(countries[0]);

  return (
    <Sidebar>
      <div className="verification-container mt-5">
        <h1>KYC Verification</h1>
        <div className="progress my-3 bg-white">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${width}%` }}
            aria-valuenow={width}
            aria-valuemin={0}
            aria-valuemax={100}
          ></div>
        </div>
        <div
          className="form-container"
          style={{ display: width === 25 ? "block" : "none" }}
        >
          <h4>Select Country</h4>
          <div className="form-group">
            <label>Country *</label>
            <div className="dropdown">
              <img src={kycData?.flag} alt="Indonesia" className="flag-icon" />
              <select
                value={JSON.stringify(kycData)}
                onChange={(country) =>
                  setKycData(JSON.parse(country.target.value))
                }
              >
                {countries?.map((country) => (
                  <option key={country?.code} value={JSON.stringify(country)}>
                    {country?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Document Type *</label>
            <div className="radio-group">
              <div>
                <input
                  type="radio"
                  id="kartu-id"
                  name="docType"
                  value="Kartu ID"
                  defaultChecked
                />
                <label htmlFor="kartu-id">ID Card</label>
              </div>
            </div>
          </div>
          <button
            onClick={() => setWidth(50)}
            className="next-button bg-primary"
          >
            Next
          </button>
        </div>
        <div style={{ display: width === 50 ? "block" : "none" }}>
          <Step2
            setWidth={setWidth}
            kycData={kycData}
            setKycData={setKycData}
          />
        </div>
        <div style={{ display: width === 75 ? "block" : "none" }}>
          <Step3
            setWidth={setWidth}
            kycData={kycData}
            setKycData={setKycData}
          />
        </div>
        <div style={{ display: width === 100 ? "block" : "none" }}>
          <Step4
            setWidth={setWidth}
            kycData={kycData}
            setKycData={setKycData}
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default VerificationForm;

interface StepProps {
  setWidth: (width: number) => void;
  kycData: KycType;
  setKycData: (kycData: KycType) => void;
}

const Step2: React.FC<StepProps> = ({ setWidth, kycData, setKycData }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUpload, setIsUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoad, setIsLoad] = useState(false);

  const handleChangeFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files?.[0];
    if (files) {
      setIsUpload(false);
      setFile(files);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(files);
    }
  };

  const handleUpload = () => {
    setIsLoad(true);
    if (file) {
      const storageRef = ref(storage, `kyc/${file.name}`);
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
            setKycData({ ...kycData, idCardUrl: downloadURL });
            setIsUpload(true);
            setIsLoad(false);
            setWidth(75);
          });
        }
      );
    }
  };

  return (
    <div className="card" style={{ padding: "40px 10px" }}>
      <div className="card-body text-center">
        <h5>Be prepared to upload your ID Card</h5>
        <div className="my-3 mx-auto" style={{ maxWidth: "250px" }}>
          <img src="/KYC.jpg" className="w-100" alt="ID Upload" />
        </div>
        <p className="text-danger">ID Card</p>
        <ul className="list-unstyled text-left">
          <li>✅ Upload files or color photos</li>
          <li>✅ Take photos in a bright room</li>
          <li>❌ Do not edit your document images</li>
        </ul>
        <div className="d-flex flex-column align-items-center gap-3">
          {imagePreview && (
            <div style={{ maxWidth: "250px", margin: "0 auto" }}>
              <img
                src={imagePreview}
                className="w-100"
                alt="Preview ID Upload"
              />
            </div>
          )}
          <input
            type="file"
            onChange={handleChangeFile}
            className="w-100 my-4"
          />
        </div>
        <div className="mt-5 d-flex justify-content-between align-items-center">
          <button className="btn btn-danger" onClick={() => setWidth(25)}>
            Back
          </button>
          {isUpload ? (
            <button onClick={() => setWidth(75)} className="btn btn-primary">
              Next
            </button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={file ? false : true}
              style={{ opacity: file ? 1 : 0.5 }}
              className="btn btn-primary"
            >
              {isLoad ? <Loading /> : "Upload Document"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Step3: React.FC<StepProps> = ({ setWidth, kycData, setKycData }) => {
  const { user } = useContext(AuthContext);
  const [isLoad, setIsLoad] = useState(false);

  const createKYCData = async () => {
    setIsLoad(true);
    try {
      await updateDoc(doc(db, "users", user?.id as string), {
        isVerify: "process",
        country: kycData?.name,
      });
      await setDoc(doc(db, "kycData", user?.id as string), {
        id: user?.id,
        username: user?.username,
        email: user?.email,
        country: kycData?.name,
        flag: kycData?.flag,
        idCardUrl: kycData?.idCardUrl,
        videoVerifyUrl: kycData?.videoVerifyUrl,
        status: "process",
        createdAt: serverTimestamp(),
      }).then(() => {
        setWidth(100);
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoad(false);
    }
  };

  useEffect(() => {
    if (kycData?.videoVerifyUrl) {
      createKYCData();
    }
  }, [kycData]);

  return (
    <div className="card" style={{ padding: "40px 10px" }}>
      {isLoad && <LargeLoad />}
      <div className="card-body text-center">
        <h5>Record a video of yourself with your ID card</h5>
        <div className="my-3 mx-auto" style={{ maxWidth: "250px" }}>
          <img src="/vidID (1).png" className="w-100" alt="ID Upload" />
        </div>
        <p className="text-danger">verification by video</p>
        <ul className="list-unstyled text-left">
          <li>✅ make a video of a maximum of 10 seconds</li>
          <li>✅ Take video in a bright room</li>
          <li>✅ show it along with your ID card</li>
        </ul>
        <div className="d-flex flex-column align-items-center gap-3">
          <WebcamComponent kycData={kycData} setKycData={setKycData} />
        </div>
        <div className="mt-5 d-flex justify-content-between align-items-center">
          <button className="btn btn-danger" onClick={() => setWidth(50)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

const Step4: React.FC<StepProps> = () => {
  return (
    <div className="card" style={{ padding: "40px 10px" }}>
      <div className="card-body text-center">
        <h5>
          Thank you for taking the time, we will process your data immediately
        </h5>
        <div className="my-3 mx-auto" style={{ maxWidth: "150px" }}>
          <img src="/check.jpg" className="w-100" alt="ID Upload" />
        </div>
        <p className="text-danger">Document will be processed</p>
        <div className="mt-5 d-flex justify-content-center align-items-center">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="btn btn-primary"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

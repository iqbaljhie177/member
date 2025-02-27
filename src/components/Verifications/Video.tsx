import React, { useRef, useState } from "react";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { KycType } from "./Verify";
import Loading from "../Loading";

interface VideoProps {
  kycData: KycType;
  setKycData: (kycData: KycType) => void;
}

const WebcamComponent: React.FC<VideoProps> = ({ kycData, setKycData }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoURL, setVideoURL] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [isLoad, setIsLoad] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartCaptureClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        const options = { mimeType: "video/webm; codecs=vp9" };
        const mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        setRecording(true);

        // Stop recording after 10 seconds
        timeoutRef.current = setTimeout(() => {
          handleStopCaptureClick();
        }, 10000); // 10000 milliseconds = 10 seconds
      }
    } catch (err) {
      console.error("Error accessing the camera: ", err);
    }
  };

  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => [...prev, event.data]);
    }
  };

  const handleStopCaptureClick = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      if (recordedChunks.length > 0) {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);
        setBlob(blob);
        setRecordedChunks([]); // Clear recordedChunks after creating blob
      }
    }
  };

  const handleUploadClick = () => {
    setIsLoad(true);
    if (blob) {
      const storage = getStorage();
      const storageRef = ref(storage, `videos/${Date.now()}.webm`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed: ", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setIsLoad(false);
            setKycData({ ...kycData, videoVerifyUrl: downloadURL });
          });
        }
      );
    }
  };

  return (
    <div>
      <div>
        <video ref={videoRef} autoPlay style={{ width: "100%" }} />
        <div>
          {!recording ? (
            <button
              className="btn btn-warning"
              onClick={handleStartCaptureClick}
            >
              Start Recording
            </button>
          ) : (
            <button
              className="btn btn-warning"
              onClick={handleStopCaptureClick}
            >
              Stop Recording
            </button>
          )}
        </div>
      </div>
      {videoURL && (
        <div>
          <h3>Recorded Video:</h3>
          <video src={videoURL} controls style={{ width: "100%" }} />
          <button className="btn btn-warning" onClick={handleUploadClick}>
            {isLoad ? <Loading /> : "Upload"}
          </button>
        </div>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div>
          <h3>Uploading: {Math.round(uploadProgress)}%</h3>
        </div>
      )}
    </div>
  );
};

export default WebcamComponent;

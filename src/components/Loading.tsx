import React from "react";

const Loading = () => {
  return (
    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
      <div className="custom-loader"></div>
    </div>
  );
};

export default Loading;

export const LargeLoad = () => {
  return (
    <div
      style={{ height: "100vh", background: "#ffffff91" }}
      className="position-absolute left-0 top-0 w-100 h-100 z-3 d-flex justify-content-center align-items-center"
    >
      <div className="large-custom-loader"></div>
    </div>
  );
};

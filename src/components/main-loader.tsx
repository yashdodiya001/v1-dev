import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import loaderAnimation from "../app/animations/text.json";

const MainLoader = () => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white">
      <Player
        autoplay
        loop
        src={loaderAnimation}
        style={{ height: "150px", width: "150px" }}
      />
    </div>
  );
};

export default MainLoader;

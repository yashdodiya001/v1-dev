import React from "react";
import { Player } from "@lottiefiles/react-lottie-player"; // Lottie React player
import loaderAnimation from "../app/animations/loader.json"; // Path to your loader JSON

const Loader = () => {
  return (
    <div>
      <Player
        autoplay
        loop
        src={loaderAnimation} // The imported JSON file
        style={{ height: "60px", width: "60px" }} // Adjust size as needed
      />
    </div>
  );
};

export default Loader;

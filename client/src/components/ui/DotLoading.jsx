import React, { useState, useEffect } from "react";

const DotLoading = ({ text = "Loading", interval = 500 }) => {
  const dotsArray = ["", ".", "..", "..."];
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % dotsArray.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  return <span>{text}{dotsArray[dotIndex]}</span>;
};

export default DotLoading;

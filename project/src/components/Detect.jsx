import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Detect.css";
import { v4 as uuidv4 } from "uuid";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import * as drawingUtils from "@mediapipe/drawing_utils";
import { HAND_CONNECTIONS } from "@mediapipe/hands";
import Webcam from "react-webcam";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Carousel from "./Carousel";

import TrainedModel from '../../Trained Model/sign_language_recognizer_25-04-2023.task'

import Yes from './SignImages/IMG-20250110-WA0002.jpg'
import Pen from './SignImages/IMG-20250110-WA0003.jpg'
import Name from './SignImages/IMG-20250110-WA0004.jpg'
import NotOK from './SignImages/IMG-20250110-WA0005.jpg'

let startTime = "";

const myImages = [
  Yes,
  Pen,
  Name,
  NotOK,
  "https://i0.wp.com/glazermuseum.org/wp-content/uploads/2020/06/ASL-alphabet.png?resize=1080%2C835&ssl=1"
];

const Detect = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const requestRef = useRef();
  const [detectedData, setDetectedData] = useState([]);
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const [textToDownload, setTextToDownload] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "production"
  ) {
    console.log = function () {};
  }

  const predictWebcam = useCallback(() => {
    if (runningMode === "IMAGE") {
      setRunningMode("VIDEO");
      gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(
      webcamRef.current.video,
      nowInMs
    );

    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    // Set canvas height and width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    // Draw the results on the canvas, if any.
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawingUtils.drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });

        drawingUtils.drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }
    }
    if (results.gestures.length > 0) {
      const detectedGesture = results.gestures[0][0].categoryName;
      setDetectedData((prevData) => [
        ...prevData,
        { SignDetected: detectedGesture },
      ]);

      handleChangeText(detectedGesture);
    }

    if (webcamRunning) {
      setTimeout(() => {
        requestRef.current = requestAnimationFrame(predictWebcam);
      }, 1000);
    }
  }, [webcamRunning, runningMode, gestureRecognizer]);

  const animate = useCallback(() => {
    requestRef.current = requestAnimationFrame(animate);
    predictWebcam();
  }, [predictWebcam]);

  const enableCam = useCallback(() => {
    if (!gestureRecognizer) {
      alert("Please wait for gestureRecognizer to load");
      return;
    }

    if (webcamRunning === true) {
      setWebcamRunning(false);
      cancelAnimationFrame(requestRef.current);
      setCurrentImage(null);

      const endTime = new Date();

      const timeElapsed = (
        (endTime.getTime() - startTime.getTime()) /
        1000
      ).toFixed(2);

      // Remove empty values
      const nonEmptyData = detectedData.filter(
        (data) => data.SignDetected !== "" && data.DetectedScore !== ""
      );

      //to filter continous same signs in an array
      const resultArray = [];
      let current = nonEmptyData[0];

      for (let i = 1; i < nonEmptyData.length; i++) {
        if (nonEmptyData[i].SignDetected !== current.SignDetected) {
          resultArray.push(current);
          current = nonEmptyData[i];
        }
      }

      resultArray.push(current);

      //calculate count for each repeated sign
      const countMap = new Map();

      for (const item of resultArray) {
        const count = countMap.get(item.SignDetected) || 0;
        countMap.set(item.SignDetected, count + 1);
      }

      const sortedArray = Array.from(countMap.entries()).sort(
        (a, b) => b[1] - a[1]
      );

      const outputArray = sortedArray
        .slice(0, 5)
        .map(([sign, count]) => ({ SignDetected: sign, count }));

      // object to send to action creator
      const data = {
        signsPerformed: outputArray,
        id: uuidv4(),
        username: user?.name,
        userId: user?.userId,
        createdAt: String(endTime),
        secondsSpent: Number(timeElapsed),
      };

      dispatch(addSignData(data));
      setDetectedData([]);
    } else {
      setWebcamRunning(true);
      startTime = new Date();
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [
    webcamRunning,
    gestureRecognizer,
    animate,
    detectedData,
    user?.name,
    user?.userId,
    dispatch,
  ]);

  const handleDownload = () => {
    const blob = new Blob([textToDownload], { type: "text/plain" }); // create blob
    const url = URL.createObjectURL(blob); // create temp URL
    const a = document.createElement("a"); // create anchor tag
    a.href = url; // set URL to blob
    a.download = "translation.txt"; // file name
    document.body.appendChild(a);
    a.click(); // trigger download
    URL.revokeObjectURL(url); // revoke object URL
    document.body.removeChild(a); // clean up
  };

  const handleChangeText = (newGesture) => {
    setTextToDownload((prevText) => {
      const lastGesture = prevText.split(" ").pop(); // Get the last gesture from the text
      if (lastGesture !== newGesture) {
        return prevText + " " + newGesture;
      }
      return prevText; // Don't append if it's the same as the last one
    });
  };

  useEffect(() => {
    async function loadGestureRecognizer() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: TrainedModel
        },
        numHands: 2,
        runningMode: runningMode,
      });
      setGestureRecognizer(recognizer);
    }
    loadGestureRecognizer();
  }, [runningMode]);

  const handleInput = (e) => {
    setEditedText(e.target.textContent);
  };

  const handleEdit = () => setIsEditing(true);
  const handleDone = () => {
    setTextToDownload(editedText);
    setIsEditing(false);
  };

  return (
    <>
      <div className="signlang_detection-container">
        <>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <motion.h1
              className="text-3xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Translate
            </motion.h1>
            <motion.div
              className="bg-white shadow overflow-hidden sm:rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4"></div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <motion.div
                  className="w-full md:w-1/2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Camera Feed
                  </h2>
                  <div className="relative bg-gray-200 rounded-lg overflow-hidden">
                    <div>
                      <Webcam audio={false} ref={webcamRef} />

                      <canvas ref={canvasRef} className="signlang_canvas" />
                    </div>
                    {!webcamRunning && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                        <p>Click 'Start Translation' to begin</p>
                      </div>
                    )}
                  </div>
                </motion.div>
                <motion.div
                  className="w-full md:w-1/2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <h2 className="text-lg font-medium text-gray-900 mb-2">
                    Translated Text
                  </h2>
                  <div className="flex flex-col justify-center">
                    <div
                      className="bg-gray-100 p-4 h-64 overflow-y-auto rounded-lg"
                      contentEditable={isEditing} // Only set contentEditable to true when isEditing is true
                      suppressContentEditableWarning
                      onInput={isEditing ? handleInput : undefined} // Set onInput only if isEditing is true
                    >
                      {textToDownload || "Translation will appear here..."}
                    </div>
                    <button
                      className="mt-4 x-4 py-2 bg-blue-600 text-white rounded-lg"
                      onClick={isEditing ? handleDone : handleEdit}
                    >
                      {isEditing ? "Done" : "Edit"}
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                className="m-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={enableCam}
              >
                {webcamRunning ? "Stop" : "Start"}
              </button>
              <button
                className="m-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={() => setTextToDownload("")}
              >
                Clear
              </button>
              <button
                className="m-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                onClick={handleDownload}
              >
                Download
              </button>
            </div>
          </div>
        </>
      </div>
      <div className="flex justify-center m-4">
        <div className="flex flex-col">
          <p className="text-center">Try These Gestures:</p>
          <Carousel images={myImages} />
        </div>
      </div>
    </>
  );
};

export default Detect;

let video;
let videoSize = 512;
let ready = false;

let model;
let label = '';

let handPose;
let hands = [];
let color;
let boxCoords = {
  sx: videoSize,
  sy: videoSize,
  sWidth: 0,
  sHeight: 0
}

function preload() {
  handPose = ml5.handPose({ flipped: true });
}

function setup() {
  createCanvas(2 * videoSize, videoSize);
  video = createCapture(VIDEO, { flipped: true }, videoReady);
  video.size(videoSize, videoSize);
  video.hide();

  let options = {
    inputs: [512, 64, 4],
    task: "imageClassification",
    debug: true
  }
  model = ml5.neuralNetwork(options);
  handPose.detectStart(video, gotHands);
}

function gotHands(results) {
  hands = results;
}

function loaded() {
  let options = {
    epochs: 50
  }
  model.train(options, classifyVideo);
}

function classifyVideo() {
  let inputImage = {
    image: video,
  };
  model.classify(inputImage, gotResults);
}

function gotResults(error, results) {
  if (error) {
    return;
  }
  label = results[0].label;
  classifyVideo();
}

function videoReady() {
  ready = true;
}

function draw() {
  background(255);

  if (ready) {
    image(video, 0, 0);
  }

  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        if (hand.handedness == "Left") {
          fill(255, 0, 255);
        } else {
          fill(255, 255, 0);
        }
        
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];
          circle(keypoint.x, keypoint.y, 16);
          boxCoords = {
            sx: min(boxCoords.sx, keypoint.x),
            sy: min(boxCoords.sy, keypoint.y),
            sWidth: max(boxCoords.sWidth, keypoint.x),
            sHeight: max(boxCoords.sHeight, keypoint.y)
          }
        }

        noFill();
        stroke(1);
        rect(boxCoords.sx, boxCoords.sy, boxCoords.sWidth - boxCoords.sx, boxCoords.sHeight - boxCoords.sy);
      }
      let handWidth = boxCoords.sWidth - boxCoords.sx + 40;
      let handHeight = boxCoords.sHeight - boxCoords.sy + 40;
      image(video, videoSize + boxCoords.sx, boxCoords.sy, handWidth, handHeight, boxCoords.sx - 20, boxCoords.sy - 20, handWidth, handHeight);

      boxCoords = {
        sx: videoSize,
        sy: videoSize,
        sWidth: 0,
        sHeight: 0
      }
    }
  }

  textSize(64);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, width / 2, 3 / 4 * height);
}

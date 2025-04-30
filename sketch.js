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

let imgs = [];

let writer;

function preload() {
  handPose = ml5.handPose({ flipped: true });

  loadStrings("strings.txt", (arr) => {
    for (let filename of arr.slice(0,5)) {
      loadImage(filename, (img) => {
        imgs.push({ img, label: filename.split("/")[1] })
        console.log(filename.split("/"));
      })
    }
  })
}

function setup() {
  createCanvas(2 * videoSize, videoSize);
  video = createCapture(VIDEO, { flipped: true }, videoReady);
  video.size(videoSize, videoSize);
  video.hide();

  writer = createWriter("test.txt");
  for (let img of imgs) {
    handPose.detect(img.img, (results) => {
      if (results.length > 0) {
        let inputs = [];
        for (let kp of results[0].keypoints) {
          inputs.push(kp.x);
          inputs.push(kp.y);
        }
        console.log(inputs);
        writer.print(img.label + " " + inputs);
      }
    })
  }

let options = {
    inputs: 42,
    outputs: 27,
    task: "classification",
    debug: true
  }
  model = ml5.neuralNetwork(options);

  handPose.detectStart(video, gotHands);
}

function keyPressed() {
  if (keyCode === ENTER) {
    writer.close();
  }
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

// function draw() {
//   background(255);

//   if (ready) {
//     image(video, 0, 0);
//   }

//   if (hands.length > 0) {
//     for (let hand of hands) {
//       if (hand.confidence > 0.1) {
//         if (hand.handedness == "Left") {
//           fill(255, 0, 255);
//         } else {
//           fill(255, 255, 0);
//         }
        
//         for (let i = 0; i < hand.keypoints.length; i++) {
//           let keypoint = hand.keypoints[i];
//           circle(keypoint.x, keypoint.y, 16);
//           boxCoords = {
//             sx: min(boxCoords.sx, keypoint.x),
//             sy: min(boxCoords.sy, keypoint.y),
//             sWidth: max(boxCoords.sWidth, keypoint.x),
//             sHeight: max(boxCoords.sHeight, keypoint.y)
//           }
//         }

//         noFill();
//         stroke(1);
//         rect(boxCoords.sx, boxCoords.sy, boxCoords.sWidth - boxCoords.sx, boxCoords.sHeight - boxCoords.sy);
//       }
//       let handWidth = boxCoords.sWidth - boxCoords.sx + 40;
//       let handHeight = boxCoords.sHeight - boxCoords.sy + 40;
//       image(video, videoSize + boxCoords.sx, boxCoords.sy, handWidth, handHeight, boxCoords.sx - 20, boxCoords.sy - 20, handWidth, handHeight);

//       boxCoords = {
//         sx: videoSize,
//         sy: videoSize,
//         sWidth: 0,
//         sHeight: 0
//       }
//     }
//   }

//   textSize(64);
//   textAlign(CENTER, CENTER);
//   fill(255);
//   text(label, width / 2, 3 / 4 * height);
// }

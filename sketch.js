let video;
let videoSize = 512;
let ready = false;

let model;
let label = '';

function setup() {
  createCanvas(400, 400);
  video = createCapture(VIDEO, videoReady);
  video.size(videoSize, videoSize);
  video.hide();

  let options = {
    inputs: [512, 64, 4],
    task: "imageClassification",
    debug: true
  }
  model = ml5.neuralNetwork(options);
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
  if (ready) {
    scale(-1, 1);
    image(video, -width, 0, width, height);
    scale(-1, 1);
  }

  textSize(64);
  textAlign(CENTER, CENTER);
  fill(255);
  text(label, width / 2, 3 / 4 * height);
}

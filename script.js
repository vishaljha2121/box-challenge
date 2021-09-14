const video = document.querySelector("video");
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let countnum = 0;
let pos = 1; //in = 0, out = 1
let color_code = "#FFFFFF";

let box_pos_x = 60;
let box_pos_y = 75;

let hand_left_x;
let hand_left_y;
let hand_right_x;
let hand_right_y;

let hand_left_x_last_pos = 0;
let hand_left_y_last_pos = 0;
let hand_right_y_last_pos = 0;
let hand_right_x_last_pos = 0;

let Hcount = 0;
let speed = 0;

let colorb = "red";

const fpsControl = FPS;

function onResults(results) {
  if (!results.poseLandmarks) {
    return;
  }

  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: color_code,
    lineWidth: point_width,
  });
  drawLandmarks(ctx, results.poseLandmarks, {
    color: "#FF0000",
    lineWidth: point_width / 2,
  });

  hand_left_x = results.poseLandmarks[16].x;
  hand_left_y = results.poseLandmarks[16].y;
  hand_right_x = results.poseLandmarks[15].x;
  hand_right_y = results.poseLandmarks[15].y;

  hitCount();
  ctx.restore();
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  },
});
pose.setOptions({
  selfieMode: true,
  modelComplexity: 1,
  enableSegmentation: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
pose.onResults(onResults);

const camera = new Camera(video, {
  onFrame: async () => {
    await pose.send({ image: video });
    document.querySelector("h1").style.display = "none";
  },
  width: width,
  height: height,
});
camera.start();

var myGamePiece;

function startGame() {
  myGamePiece = new component(60, 60, colorb, 60, 75);
  myGameArea.start();
}

var myGameArea = {
  canvas: document.createElement("canvas"),
  start: function () {
    this.canvas.width = 480;
    this.canvas.height = 270;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[0]);
    this.interval = setInterval(updateGameArea, 20);
  },
  stop: function () {
    clearInterval(this.interval);
  },
  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};

function component(width, height, color, x, y, type) {
  this.type = type;
  this.width = width;
  this.height = height;
  this.x = x;
  this.y = y;
  this.speedX = 0;
  this.speedY = speed;
  this.gravity = 0.1;
  this.gravitySpeed = 0;
  this.bounce = 1.0;
  this.update = function () {
    ctx2 = myGameArea.context;
    ctx2.fillStyle = colorb;
    ctx2.fillRect(this.x, this.y, this.width, this.height);
  };
  this.newPos = function () {
    this.gravitySpeed += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY + this.gravitySpeed;

    box_pos_x = this.x;
    box_pos_y = this.y;

    this.hitBottom();
  };
  this.hitBottom = function () {
    var rockbottom = myGameArea.canvas.height - this.height;
    if (this.y > rockbottom) {
      this.y = rockbottom;
      this.gravitySpeed = -(this.gravitySpeed * this.bounce);
    }
  };
}

function updateGameArea() {
  myGameArea.clear();
  myGamePiece.newPos();
  myGamePiece.update();
}

function hitCount() {
  /* document.getElementById("box_x").innerHTML = (box_pos_x / 480).toFixed(2);
  document.getElementById("box_y").innerHTML = (box_pos_y / 446).toFixed(1);
  document.getElementById("hand_ly").innerHTML = hand_left_y.toFixed(1);
  document.getElementById("hand_lx").innerHTML = hand_left_x.toFixed(1);
  document.getElementById("hand_ry").innerHTML = hand_right_y.toFixed(1);
  document.getElementById("hand_rx").innerHTML = hand_right_x.toFixed(1); */
  let speed_l_x = Math.abs(hand_left_x.toFixed(1) - hand_left_x_last_pos) / 0.5;
  let speed_r_x =
    Math.abs(hand_right_x.toFixed(1) - hand_right_x_last_pos) / 0.5;

  /* document.getElementById("speed_l").innerHTML = speed_l_x.toFixed(1);
  document.getElementById("speed_r").innerHTML = speed_r_x.toFixed(1); */

  if (speed_l_x < 0.1 && speed_r_x < 0.1) {
    document.getElementById("message").innerHTML = "Punch Harder";
  } else if (speed_l_x > 0.1 || speed_r_x > 0.1) {
    document.getElementById("message").innerHTML = "Punch Speed is good";
  }

  hand_left_x_last_pos = hand_left_x.toFixed(1);
  hand_left_y_last_pos = hand_left_y.toFixed(1);
  hand_right_x_last_pos = hand_right_x.toFixed(1);
  hand_right_y_last_pos = hand_right_y.toFixed(1);

  if (
    (((box_pos_x / 480).toFixed(1) == hand_left_x.toFixed(1) &&
      (box_pos_y / 445).toFixed(1) == hand_left_y.toFixed(1)) ||
      ((box_pos_x / 480).toFixed(1) == hand_right_x.toFixed(1) &&
        (box_pos_y / 445).toFixed(1) == hand_right_y.toFixed(1))) &&
    (speed_l_x > 0.15 || speed_r_x > 0.15)
  ) {
    Hcount++;
    document.getElementById("counter").innerHTML = Hcount;

    if (Hcount % 2 == 0) {
      colorb = "red";
    } else {
      colorb = "green";
    }
    speed = speed + 0.1;
  }
}

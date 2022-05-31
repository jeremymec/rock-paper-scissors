import rock from "../static/rock.png";
import {
  STARTING_VELOCITY,
  STARTING_SIGNS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  SIGN_WIDTH,
  SIGN_HEIGHT,
} from "./settings";

interface Sign {
  type: SignType;
  position: Coordinate;
  velocity: Coordinate;
  resolvingCollision: boolean;
}

type SignType = "ROCK" | "PAPER" | "SCISSORS";

type Dimension = [width: number, height: number];
type Coordinate = [x: number, y: number];

const signs: Sign[] = [];

const typeToEmojiMap: { [type in SignType]: string } = {
  ROCK: "🪨",
  PAPER: "📜",
  SCISSORS: "✂️",
};

let ctx: CanvasRenderingContext2D;
let signSizeDynamic: Dimension;

const setup = () => {
  const spawnWidth = CANVAS_WIDTH / 4;
  const spawnHeight = CANVAS_HEIGHT / 4;
  const buffer = 25;

  const spawnOneStart: Dimension = [buffer, buffer];
  const spawnOneEnd: Dimension = [spawnWidth, spawnHeight];

  const spawnTwoStart: Dimension = [spawnWidth * 2, buffer];
  const spawnTwoEnd: Dimension = [spawnWidth * 3, spawnHeight];

  const spawnThreeStart: Dimension = [spawnWidth * 1.5, spawnHeight];
  const spawnThreeEnd: Dimension = [spawnWidth * 2.5, spawnHeight * 2];

  const generateSpawnPointFromRange = (
    start: Coordinate,
    end: Coordinate
  ): Coordinate => {
    const random_x = Math.random() * (end[0] - start[0]) + start[0];
    const random_y = Math.random() * (end[1] - start[1]) + start[1];

    const temp_sign: Sign = {
      position: [random_x, random_y],
      type: "ROCK",
      resolvingCollision: false,
      velocity: [0, 0]
    }

    if (checkSignCollision(temp_sign, signs).length >= 1) {
      return generateSpawnPointFromRange(start, end);
    }

    return [random_x, random_y];
  };

  for (let i = 0; i < STARTING_SIGNS[0]; i++) {
    signs.push({
      position: generateSpawnPointFromRange(spawnOneStart, spawnOneEnd),
      type: "ROCK",
      velocity: [STARTING_VELOCITY, STARTING_VELOCITY],
      resolvingCollision: false,
    });
  }
  for (let i = 0; i < STARTING_SIGNS[1]; i++) {
    signs.push({
      position: generateSpawnPointFromRange(spawnTwoStart, spawnTwoEnd),
      type: "PAPER",
      velocity: [STARTING_VELOCITY, STARTING_VELOCITY],
      resolvingCollision: false,
    });
  }
  for (let i = 0; i < STARTING_SIGNS[2]; i++) {
    signs.push({
      position: generateSpawnPointFromRange(spawnThreeStart, spawnThreeEnd),
      type: "SCISSORS",
      velocity: [STARTING_VELOCITY, STARTING_VELOCITY],
      resolvingCollision: false,
    });
  }

  // signs.length = 0;
  // const test: Sign[] = [
  //   {
  //     position: [300, 310],
  //     type: "ROCK",
  //     velocity: [0, 1],
  //     resolvingCollision: false,
  //   },
  //   {
  //     position: [300, 300],
  //     type: "ROCK",
  //     velocity: [0, -1],
  //     resolvingCollision: false,
  //   },
  // ];
  // signs.push(...test);
};

const loop = () => {
  for (let sign of signs) {
    if (!checkSignInXBounds(sign)) {
      sign.velocity[0] = -sign.velocity[0];
    }
    if (!checkSignInYBounds(sign)) {
      sign.velocity[1] = -sign.velocity[1];
    }

    const collides = checkSignCollision(
      sign,
      signs.filter((s) => s !== sign)
    );

    if (collides.length > 0) {
      for (let colidee of collides) {
        handleSignCollision(sign, colidee);
        colidee.resolvingCollision = true;
      }
      sign.resolvingCollision = true;
    } else {
      sign.resolvingCollision = false;
    }

    sign.position[0] += sign.velocity[0];
    sign.position[1] += sign.velocity[1];
  }

  redrawSigns();
};

const redrawSigns = () => {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  for (let sign of signs) {
    drawSign(sign);
  }
};

const drawSign = (sign: Sign) => {
  ctx.fillText(typeToEmojiMap[sign.type], sign.position[0], sign.position[1]);
};

const checkSignInXBounds = (sign: Sign): boolean => {
  return (
    sign.position[0] >= 0 &&
    sign.position[0] + signSizeDynamic[0] <= CANVAS_WIDTH
  );
};

const checkSignInYBounds = (sign: Sign): boolean => {
  return (
    sign.position[1] >= 0 &&
    sign.position[1] + signSizeDynamic[1] <= CANVAS_HEIGHT
  );
};

const checkSignCollision = (sign: Sign, potentials: Sign[]): Sign[] => {
  return potentials.filter((potential) => {
    return (
      sign.position[0] < potential.position[0] + signSizeDynamic[0] &&
      sign.position[0] + signSizeDynamic[0] > potential.position[0] &&
      sign.position[1] < potential.position[1] + signSizeDynamic[1] &&
      sign.position[1] + signSizeDynamic[1] > potential.position[1]
    );
  });
};

const handleSignCollision = (first: Sign, second: Sign): void => {
  if (first.resolvingCollision && second.resolvingCollision) {
    if (coordinateEqual(first.velocity, second.velocity)) {
      invertVelocity([first]);
    }
    return;
  }
  else if (first.resolvingCollision || second.resolvingCollision) { 
    return;
   }
  const result = rockPaperScissors(first.type, second.type);
  first.type = result;
  second.type = result;
  invertVelocity([first, second]);
  console.log(
    `Collision between ${JSON.stringify(first)} and ${JSON.stringify(second)}`
  );
};

const coordinateEqual = (first: Coordinate, second: Coordinate): boolean => {
  return first[0] === second[0] && first[1] === second[1]
}

const invertVelocity = (signs: Sign[]): void => {
  for (let sign of signs) {
    sign.velocity = [-sign.velocity[0], -sign.velocity[1]];
  }
};

const rockPaperScissors = (first: SignType, second: SignType): SignType => {
  if (first === "ROCK" && second === "ROCK") {
    return "ROCK";
  }
  if (first === "PAPER" && second === "PAPER") {
    return "PAPER";
  }
  if (first === "SCISSORS" && second === "SCISSORS") {
    return "SCISSORS";
  }
  if (first === "ROCK" && second === "PAPER") {
    return "PAPER";
  }
  if (second === "ROCK" && first === "PAPER") {
    return "PAPER";
  }
  if (first === "ROCK" && second === "SCISSORS") {
    return "ROCK";
  }
  if (second === "ROCK" && first === "SCISSORS") {
    return "ROCK";
  }
  if (first === "PAPER" && second === "SCISSORS") {
    return "SCISSORS";
  }
  if (second === "PAPER" && first === "SCISSORS") {
    return "SCISSORS";
  }
};

window.onload = () => {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = CANVAS_WIDTH;
  canvasElement.height = CANVAS_HEIGHT;
  document.body.appendChild(canvasElement);
  ctx = canvasElement.getContext("2d");

  ctx.font = "30px Arial";

  signSizeDynamic = [ctx.measureText("🪨").width, ctx.measureText("🪨").width];

  setup();

  const interval = setInterval(() => {
    loop();
  }, 20);
};

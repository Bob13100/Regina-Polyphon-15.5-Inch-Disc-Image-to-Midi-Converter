const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
const workspace = document.getElementById("workspace");
const centerDot = document.getElementById("centerDot");
const rotationHandle = document.getElementById("rotationHandle");
const startGuide = document.getElementById("startGuide");
const edgeGuide = document.getElementById("edgeGuide");
const canvas = document.getElementById("discCanvas");
const ctx = canvas.getContext("2d");
const scanDiscV = document.getElementById("scanDisc");

let draggingObject = null;
let rotating = false;

upload.addEventListener("change", function () {
  workspace.style.display = "inline-block";
  image.src = URL.createObjectURL(upload.files[0]);
});

image.addEventListener("dragstart", function (event) {
  event.preventDefault();
});

image.onload = function () {
  canvas.width = 800;
  canvas.height = 800;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, 800, 800);
};

function scanDiscF() {
  if (!image.src) return;

  canvas.width = 800;
  canvas.height = 800;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, 800, 800);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  const workspaceRect = workspace.getBoundingClientRect();
  const centerRect = centerDot.getBoundingClientRect();
  const edgeRect = edgeGuide.getBoundingClientRect();

  const centerX = centerRect.left - workspaceRect.left + centerRect.width / 2;
  const centerY = centerRect.top - workspaceRect.top + centerRect.height / 2;

  const edgeX = edgeRect.left - workspaceRect.left + edgeRect.width / 2;
  const edgeY = edgeRect.top - workspaceRect.top + edgeRect.height / 2;

  const radius = Math.sqrt(
    (edgeX - centerX) ** 2 +
    (edgeY - centerY) ** 2
  );

  const threshold = 100;
  const minArea = 8;
  const maxArea = 500;

  const dark = new Uint8Array(canvas.width * canvas.height);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;

      if (dx * dx + dy * dy > radius * radius) continue;

      const index = (y * canvas.width + x) * 4;
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const gray = (red + green + blue) / 3;

      if (gray < threshold) {
        dark[y * canvas.width + x] = 1;
      }
    }
  }

  const visited = new Uint8Array(canvas.width * canvas.height);
  const neighbors = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [1, 1], [1, -1], [-1, 1], [-1, -1]
  ];

  function indexOf(x, y) {
    return y * canvas.width + x;
  }

  function inBounds(x, y) {
    return x >= 0 && x < canvas.width && y >= 0 && y < canvas.height;
  }

  const foundBlobs = [];

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const startIndex = indexOf(x, y);

      if (!dark[startIndex] || visited[startIndex]) continue;

      const stack = [[x, y]];
      visited[startIndex] = 1;

      const pixelsInBlob = [];

      while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        pixelsInBlob.push([cx, cy]);

        for (const [dx, dy] of neighbors) {
          const nx = cx + dx;
          const ny = cy + dy;

          if (!inBounds(nx, ny)) continue;

          const ni = indexOf(nx, ny);
          if (dark[ni] && !visited[ni]) {
            visited[ni] = 1;
            stack.push([nx, ny]);
          }
        }
      }

      const area = pixelsInBlob.length;
      if (area < minArea || area > maxArea) continue;

      let sumX = 0;
      let sumY = 0;

      for (const [px, py] of pixelsInBlob) {
        sumX += px;
        sumY += py;
      }

      const blobX = sumX / area;
      const blobY = sumY / area;

      let mu20 = 0;
      let mu02 = 0;
      let mu11 = 0;

      for (const [px, py] of pixelsInBlob) {
        const rx = px - blobX;
        const ry = py - blobY;

        mu20 += rx * rx;
        mu02 += ry * ry;
        mu11 += rx * ry;
      }

      const blobAngle = 0.5 * Math.atan2(2 * mu11, mu20 - mu02);
      const radialAngle = Math.atan2(blobY - centerY, blobX - centerX);

      let angleDiff = Math.abs(blobAngle - radialAngle);
      angleDiff = ((angleDiff + Math.PI) % Math.PI);
      if (angleDiff > Math.PI / 2) angleDiff = Math.PI - angleDiff;

      const isRadial = angleDiff < 0.6;

      if (isRadial) {
        const angle = (Math.atan2(blobY - centerY, blobX - centerX) + 2 * Math.PI) % (2 * Math.PI);
        const distance = Math.sqrt((blobX - centerX) ** 2 + (blobY - centerY) ** 2);

        foundBlobs.push({
          x: blobX,
          y: blobY,
          area: area,
          angleDiff: angleDiff,
          angle: angle,
          distance: distance
        });
      }
    }
  }

  foundBlobs.sort((a, b) => a.angle - b.angle);

  console.log("Detected blobs sorted by angle:", foundBlobs);
}

scanDiscV.addEventListener("click", scanDiscF);

centerDot.addEventListener("mousedown", function (event) {
  event.preventDefault();
  draggingObject = centerDot;
});

rotationHandle.addEventListener("mousedown", function (event) {
  event.preventDefault();
  event.stopPropagation();
  rotating = true;
});

edgeGuide.addEventListener("mousedown", function (event) {
  event.preventDefault();
  draggingObject = edgeGuide;
});

startGuide.addEventListener("mousedown", function (event) {
  event.preventDefault();
  draggingObject = startGuide;
});

document.addEventListener("mousemove", function (event) {
  const rect = workspace.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (draggingObject === centerDot) {
    centerDot.style.left = (mouseX - centerDot.offsetWidth / 2) + "px";
    centerDot.style.top = (mouseY - centerDot.offsetHeight / 2) + "px";
  }

  if (draggingObject === edgeGuide) {
    edgeGuide.style.left = (mouseX - edgeGuide.offsetWidth / 2) + "px";
  }

  if (draggingObject === startGuide) {
    startGuide.style.left = mouseX + "px";
    startGuide.style.top = mouseY + "px";
  }

  if (rotating) {
    const centerStartX = rect.left + parseFloat(startGuide.style.left);
    const centerStartY = rect.top + parseFloat(startGuide.style.top);

    const dx = event.clientX - centerStartX;
    const dy = event.clientY - centerStartY;

    const angle = Math.atan2(dy, dx);
    startGuide.style.transform = `rotate(${angle}rad)`;
  }
});

document.addEventListener("mouseup", function () {
  draggingObject = null;
  rotating = false;
});

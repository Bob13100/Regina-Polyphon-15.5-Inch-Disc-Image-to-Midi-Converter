const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
const workspace = document.getElementById("workspace");
const centerDot = document.getElementById("centerDot");
const rotationHandle = document.getElementById("rotationHandle");
const startGuide = document.getElementById("startGuide");
const edgeGuide = document.getElementById("edgeGuide");
const canvas = document.getElementById("discCanvas");
const ctx = canvas.getContext("2d");

let draggingObject = null;
let rotating = false;

upload.addEventListener("change", function(){
  
  workspace.style.display = "inline-block";
  
  image.src = URL.createObjectURL(upload.files[0]);  
  });

image.onload = function () {

    canvas.width = 800;
    canvas.height = 800;

    ctx.drawImage(image, 0, 0, 800, 800);

    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Scan settings
const threshold = 100;      // darkness threshold
const minArea = 8;          // ignore tiny specks
const maxArea = 500;        // ignore huge blobs

// Make a mask of dark pixels inside the disc
const dark = new Uint8Array(canvas.width * canvas.height);

for (let y = 0; y < canvas.height; y++) {
  for (let x = 0; x < canvas.width; x++) {
    const dx = x - centerX;
    const dy = y - centerY;

    // Skip anything outside the disc
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

// Flood fill to find connected blobs
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

    // Start a new blob
    const queue = [[x, y]];
    visited[startIndex] = 1;

    const pixelsInBlob = [];

    while (queue.length > 0) {
      const [cx, cy] = queue.pop();
      pixelsInBlob.push([cx, cy]);

      for (const [dx, dy] of neighbors) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (!inBounds(nx, ny)) continue;

        const ni = indexOf(nx, ny);
        if (dark[ni] && !visited[ni]) {
          visited[ni] = 1;
          queue.push([nx, ny]);
        }
      }
    }

    const area = pixelsInBlob.length;
    if (area < minArea || area > maxArea) continue;

    // Compute centroid
    let sumX = 0;
    let sumY = 0;

    for (const [px, py] of pixelsInBlob) {
      sumX += px;
      sumY += py;
    }

    const blobX = sumX / area;
    const blobY = sumY / area;

    // Compute blob orientation using image moments
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

    // Angle of the blob's major axis
    const blobAngle = 0.5 * Math.atan2(2 * mu11, mu20 - mu02);

    // Angle from disc center to blob center
    const radialAngle = Math.atan2(blobY - centerY, blobX - centerX);

    // Compare the two angles
    let angleDiff = Math.abs(blobAngle - radialAngle);
    angleDiff = ((angleDiff + Math.PI) % Math.PI); // wrap to 0..PI
    if (angleDiff > Math.PI / 2) angleDiff = Math.PI - angleDiff;

    // If the blob's long axis is close to radial, keep it
    const isRadial = angleDiff < 0.6; // about 34 degrees tolerance

    if (isRadial) {
      foundBlobs.push({
        x: blobX,
        y: blobY,
        area: area,
        angleDiff: angleDiff
      });

      // Mark detected blobs red
      for (const [px, py] of pixelsInBlob) {
        const idx = (py * canvas.width + px) * 4;
        pixels[idx] = 255;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
      }
    }
  }
}

ctx.putImageData(imageData, 0, 0);

console.log("Detected blobs:", foundBlobs);

   
    const centerX = parseFloat(centerDot.style.left);
    const centerY = parseFloat(centerDot.style.top);

    
    const edgeX = parseFloat(edgeGuide.style.left);
    const edgeY = parseFloat(edgeGuide.style.top);

    
    const radius = Math.sqrt(
        (edgeX - centerX) ** 2 +
        (edgeY - centerY) ** 2
    );

   
    for (let y = 0; y < canvas.height; y++) {

        for (let x = 0; x < canvas.width; x++) {

            const dx = x - centerX;
            const dy = y - centerY;

           
            if (dx * dx + dy * dy > radius * radius)
                continue;

            const index = (y * canvas.width + x) * 4;

            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];

            const gray = (red + green + blue) / 3;

            if (gray < 100) {

    pixels[index] = 255;
    pixels[index + 1] = 0;
    pixels[index + 2] = 0;

            }
        }
    }
  ctx.putImageData(imageData, 0, 0);
}
  
image.addEventListener("dragstart", function(event){
  event.preventDefault();
});

centerDot.addEventListener("mousedown",function(){
  event.preventDefault();
  
  draggingObject = centerDot;
  
});

rotationHandle.addEventListener("mousedown",function(){
  event.preventDefault();

  event.stopPropagation();

  rotating = true;
  
});

edgeGuide.addEventListener("mousedown",function(){
  event.preventDefault();
  
  draggingObject = edgeGuide;
  
});

startGuide.addEventListener("mousedown",function(){
  event.preventDefault();
  
  draggingObject = startGuide;
  
});

document.addEventListener("mousemove",function(event){

  const rect = workspace.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (draggingObject === centerDot) {

    centerDot.style.left = (mouseX - 10) + "px";
    centerDot.style.top = (mouseY - 10) + "px";
  
  }

  if (draggingObject === edgeGuide) {

    edgeGuide.style.left = mouseX + "px";
  
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

document.addEventListener("mouseup",function(){
  
  draggingObject = null;

  rotating = false;
  
});

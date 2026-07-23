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

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);

    // -----------------------
    // Get center of disc
    // -----------------------
    const centerX = parseFloat(centerDot.style.left);
    const centerY = parseFloat(centerDot.style.top);

    // -----------------------
    // Get edge guide position
    // -----------------------
    const edgeX = parseFloat(edgeGuide.style.left);
    const edgeY = parseFloat(edgeGuide.style.top);

    // -----------------------
    // Calculate radius
    // -----------------------
    const radius = Math.sqrt(
        (edgeX - centerX) ** 2 +
        (edgeY - centerY) ** 2
    );

    // -----------------------
    // Scan pixels
    // -----------------------
    for (let y = 0; y < canvas.height; y++) {

        for (let x = 0; x < canvas.width; x++) {

            const dx = x - centerX;
            const dy = y - centerY;

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {

                // Read this pixel
                const pixel = ctx.getImageData(x, y, 1, 1).data;

            }

        }

    }

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

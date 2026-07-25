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

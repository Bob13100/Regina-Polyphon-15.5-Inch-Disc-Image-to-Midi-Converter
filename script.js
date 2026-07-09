const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
const workspace = document.getElementById("workspace");
const centerDot = document.getElementById("centerDot");
const rotationHandle = document.getElementById("rotationHandle");
const startGuide = document.getElementById("startGuide");
const edgeGuide = document.getElementById("edgeGuide")

let draggingObject = null;
let rotating = false;

upload.addEventListener("change", function(){
  
  workspace.style.display = "inline-block";
  
  image.src = URL.createObjectURL(upload.files[0]);  
  });

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

    const centerX = rect.left + 400;
    const centerY = rect.top + 400;
    
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    
    const angle = Math.atan2(dx, dy);

    startGuide.style.transform = `rotate(${angle}rad)`;
    
  }
  
});

document.addEventListener("mouseup",function(){
  
  draggingObject = null;

  rotating = false;
  
});

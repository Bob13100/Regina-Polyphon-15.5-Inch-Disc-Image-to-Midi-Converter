const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
const workspace = document.getElementById("workspace");
const centerDot = document.getElementById("centerDot");

let dragging = false;
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
  dragging = true;
});

document.addEventListener("mousemove",function(event){

  const rect = workspace.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  if (dragging) {

    centerDot.style.left = (event.clientX - rect.left - 10) + "px";
    centerDot.style.top = (event.clientY - rect.top - 10) + "px";
    
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
  dragging = false;
});

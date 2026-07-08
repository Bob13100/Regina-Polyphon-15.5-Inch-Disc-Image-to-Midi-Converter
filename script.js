let dragging = false;

const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
const workspace = document.getElementById("workspace");
const centerDot = document.getElementById("centerDot");

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

  if (dragging) {
    const rect= workspace.getBoundingClientRect();
    centerDot.style.left = (event.clientX - rect.left - 10) + "px";
    centerDot.style.top = (event.clientY - rect.top - 10) + "px";
  }
});

document.addEventListener("mouseup",function(){
  dragging = false;
});

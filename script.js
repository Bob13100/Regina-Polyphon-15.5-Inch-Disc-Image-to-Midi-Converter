let dragging = false;

const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
const workspace = document.getElementById("workspace");
const centerDot = document.getElementById("centerDot");

upload.addEventListener("change", function(){
  
  workspace.style.display = "inline-block";
  
  image.src = URL.createObjectURL(upload.files[0]);  
  });
centerDot.addEventListener("mousedown",function(){
  dragging = true;
});

document.addEventListener("mousemove",function(event){

  if (dragging) {
    centerDot.style.left = event.clientX + "px";
    centerDot.style.top = event.clientY + "px";
  }
});

document.addEventListener("mouseup",function(){
  dragging = false;
});

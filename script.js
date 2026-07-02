const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
const workspace = document.getElementById("workspace");

upload.addEventListener("change", function(){
  
  workspace.style.display = "inline-block";
  
  image.src = URL.createObjectURL(upload.files[0]);  
  }
);

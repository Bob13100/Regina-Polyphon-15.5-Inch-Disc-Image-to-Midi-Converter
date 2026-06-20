const upload = document.getElementById("imageUpload");
const image = document.getElementById("discImage");
upload.addEventListener(
  "change",
  function(){
  image.src = URL.createObjectURL(upload.files[0]);  
  }
);

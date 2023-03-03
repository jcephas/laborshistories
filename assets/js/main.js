// Get the modal
var modal = document.getElementById("researchModal");

// Get the link that opens the modal
var link = document.getElementById("researchLink");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// when the link is clicked, open the modal
link.onclick = function() {
  modal.style.display = "block";
}

// when the text within the <span> element is clicked, close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
  modal.style.display = "none";
  }
} 
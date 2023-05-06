// tab switcher
document.addEventListener("DOMContentLoaded", function () {
  // tabs
  const menuItems = document.querySelectorAll(".menuitem");

  // click listener
  menuItems.forEach((button) => {
    button.addEventListener("click", function () {
      const targetDiv = button.getAttribute("data-target");

      // hide all divs
      const allDivs = document.querySelectorAll(".section");
      allDivs.forEach((div) => {
        div.style.display = "none";
      });

      // show target div
      document.querySelector(targetDiv).style.display = "block";
      menuItems.forEach((button) => {
        button.classList.remove("activemenu");
      });
      button.classList.add("activemenu");
    });
  });

  // show intro
  document.querySelector("#intro").style.display = "block";
  menuItems[0].classList.add("activemenu");
});

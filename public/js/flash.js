//for flash msg to disaper over time
(() => {
  const flashes = document.querySelectorAll(".flash-message");

  flashes.forEach((flash) => {
    setTimeout(() => {
      flash.style.transition = "opacity 0.8s";
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 1000);
    }, 1000); // 1 seconds
  });

})();

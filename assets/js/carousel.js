document.addEventListener("DOMContentLoaded", function () {
  // Move all shortcode-rendered modals to <body> so Bootstrap backdrop stacks correctly
  document.querySelectorAll(".carousel-image-modal").forEach(function (modal) {
    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }
  });

  const carousels = document.querySelectorAll(".carousel");
  carousels.forEach(function (carousel) {
    const ele = carousel.querySelector("ul");
    const amountvisible = Math.round(
      ele.offsetWidth / ele.querySelector("li:nth-child(1)").offsetWidth,
    );
    const bullets = carousel.querySelectorAll("ol li");
    const slides = carousel.querySelectorAll("ul li");
    const nextarrow = carousel.querySelector(".next");
    const prevarrow = carousel.querySelector(".prev");

    const fullsizeButtons = Array.from(
      carousel.querySelectorAll(".carousel-fullsize"),
    );

    const modalId = carousel.getAttribute("data-modal-id");
    const modalImageId = carousel.getAttribute("data-modal-image-id");
    const modalDescId = carousel.getAttribute("data-modal-desc-id");

    const modalEl = modalId ? document.getElementById(modalId) : null;
    const modalImg = modalImageId
      ? document.getElementById(modalImageId)
      : null;
    const modalDesc = modalDescId ? document.getElementById(modalDescId) : null;

    const bsModal =
      modalEl && window.bootstrap ? new bootstrap.Modal(modalEl) : null;

    const modalPrev = modalEl
      ? modalEl.querySelector(".carousel-modal-prev")
      : null;
    const modalNext = modalEl
      ? modalEl.querySelector(".carousel-modal-next")
      : null;

    let currentModalIndex = 0;

    const showFullsizeImage = function (index) {
      if (!bsModal || !modalImg || fullsizeButtons.length === 0) return;

      currentModalIndex =
        (index + fullsizeButtons.length) % fullsizeButtons.length;

      const button = fullsizeButtons[currentModalIndex];

      modalImg.src = button.getAttribute("data-fullsize");
      modalImg.alt = button.getAttribute("data-alt") || "";

      if (modalDesc) {
        const template = button.querySelector(".desc");
        modalDesc.innerHTML = template.innerHTML;
      }
    };

    // Cleanup image on close
    if (modalEl && modalImg) {
      modalEl.addEventListener("hidden.bs.modal", function () {
        modalImg.src = "";
        modalImg.alt = "";
      });
    }

    let isDown = false;
    let startX;
    let scrollLeft;

    // Initialize the carousel
    nextarrow.style.display = "block";
    prevarrow.style.display = "block";
    ele.scrollLeft = 0;
    bullets[0].classList.add("selected");
    slides[0].classList.add("selected");
    if (amountvisible > 1) {
      var removeels = carousel.querySelectorAll(
        "ol li:nth-last-child(-n + " + (amountvisible - 1) + ")",
      );
      removeels.forEach(function (removeel) {
        removeel.remove();
      });
    }

    const setSelected = function () {
      bullets.forEach(function (bullet) {
        bullet.classList.remove("selected");
      });
      slides.forEach(function (slide) {
        slide.classList.remove("selected");
      });
      const scrolllength =
        carousel.querySelector("ul li:nth-child(2)").offsetLeft -
        carousel.querySelector("ul li:nth-child(1)").offsetLeft;
      const nthchild = Math.round(ele.scrollLeft / scrolllength + 1);
      carousel
        .querySelector("ol li:nth-child(" + nthchild + ")")
        .classList.add("selected");
      carousel
        .querySelector("ul li:nth-child(" + nthchild + ")")
        .classList.add("selected");
      if (carousel.parentElement.parentElement.querySelector(".dynamictitle")) {
        const title = carousel
          .querySelector("ul li:nth-child(" + nthchild + ") img")
          .getAttribute("title");
        if (title)
          carousel.parentElement.parentElement.querySelector(
            ".dynamictitle",
          ).innerHTML = title;
      }
    };

    const scrollTo = function (event) {
      event.preventDefault();
      ele.scrollLeft = ele.querySelector(this.getAttribute("href")).offsetLeft;
    };

    const nextSlide = function () {
      if (
        !carousel
          .querySelector("ol li:last-child")
          .classList.contains("selected")
      ) {
        carousel
          .querySelector("ol li.selected")
          .nextElementSibling.querySelector("a")
          .click();
      } else {
        carousel.querySelector("ol li:first-child a").click();
      }
    };

    const prevSlide = function () {
      if (
        !carousel
          .querySelector("ol li:first-child")
          .classList.contains("selected")
      ) {
        carousel
          .querySelector("ol li.selected")
          .previousElementSibling.querySelector("a")
          .click();
      } else {
        carousel.querySelector("ol li:last-child a").click();
      }
    };

    const setInteracted = function () {
      ele.classList.add("interacted");
    };

    // Attach the handlers
    ele.addEventListener("scroll", debounce(setSelected));
    ele.addEventListener("touchstart", setInteracted);
    ele.addEventListener("keydown", function (e) {
      if (e.key == "ArrowLeft") ele.classList.add("interacted");
      if (e.key == "ArrowRight") ele.classList.add("interacted");
    });
    ele.addEventListener("mousedown", (e) => {
      isDown = true;
      ele.classList.add("grabbing");
      startX = e.pageX - ele.offsetLeft;
      scrollLeft = ele.scrollLeft;
      ele.classList.add("interacted");
    });
    ele.addEventListener("mouseleave", () => {
      isDown = false;
      ele.classList.remove("grabbing");
      ele.scrollLeft = ele.scrollLeft - 1; //trigger scroll event to update selected bullet
      ele.scrollLeft = ele.scrollLeft + 1; //trigger scroll event to update selected bullet
    });
    ele.addEventListener("mouseup", () => {
      isDown = false;
      ele.classList.remove("grabbing");
      ele.scrollLeft = ele.scrollLeft - 1; //trigger scroll event to update selected bullet
      ele.scrollLeft = ele.scrollLeft + 1; //trigger scroll event to update selected bullet
    });
    ele.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - ele.offsetLeft;
      const walk = x - startX;
      ele.scrollLeft = scrollLeft - walk;
    });

    nextarrow.addEventListener("click", nextSlide);
    nextarrow.addEventListener("mousedown", setInteracted);
    nextarrow.addEventListener("touchstart", setInteracted);

    prevarrow.addEventListener("click", prevSlide);
    prevarrow.addEventListener("mousedown", setInteracted);
    prevarrow.addEventListener("touchstart", setInteracted);

    bullets.forEach(function (bullet) {
      bullet.querySelector("a").addEventListener("click", scrollTo);
      bullet.addEventListener("mousedown", setInteracted);
      bullet.addEventListener("touchstart", setInteracted);
    });

    // Fullsize modal handling
    fullsizeButtons.forEach(function (button, index) {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (!bsModal || !modalImg) return;

        showFullsizeImage(index);
        bsModal.show();
      });

      // prevent drag conflict
      button.addEventListener("mousedown", function (e) {
        e.stopPropagation();
      });

      button.addEventListener(
        "touchstart",
        function (e) {
          e.stopPropagation();
        },
        { passive: true },
      );
    });

    if (modalPrev) {
      modalPrev.addEventListener("click", function () {
        showFullsizeImage(currentModalIndex - 1);
        prevSlide();
      });
    }

    if (modalNext) {
      modalNext.addEventListener("click", function () {
        showFullsizeImage(currentModalIndex + 1);
        nextSlide();
      });
    }

    if (modalEl) {
      modalEl.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") {
          showFullsizeImage(currentModalIndex - 1);
        }

        if (e.key === "ArrowRight") {
          showFullsizeImage(currentModalIndex + 1);
        }
      });
    }

    //setInterval for autoplay
    if (carousel.getAttribute("duration")) {
      setInterval(function () {
        if (
          ele != document.querySelector(".auto-carousel:hover ul") &&
          ele.classList.contains("interacted") == false
        ) {
          nextarrow.click();
        }
      }, carousel.getAttribute("duration"));
    }
  }); //end foreach
}); //end onload

/**
 * Debounce functions for better performance
 * (c) 2021 Chris Ferdinandi, MIT License, https://gomakethings.com
 * @param  {Function} fn The function to debounce
 */
function debounce(fn) {
  // Setup a timer
  let timeout;
  // Return a function to run debounced
  return function () {
    // Setup the arguments
    let context = this;
    let args = arguments;
    // If there's a timer, cancel it
    if (timeout) {
      window.cancelAnimationFrame(timeout);
    }
    // Setup the new requestAnimationFrame()
    timeout = window.requestAnimationFrame(function () {
      fn.apply(context, args);
    });
  };
}

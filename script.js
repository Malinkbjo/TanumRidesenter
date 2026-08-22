const header = document.querySelector(".site-header");
const nav = document.querySelector(".nav");
const menuButton = document.querySelector(".menu-button");

/* =========================
   HEADER
========================= */

function updateHeader() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 20);
}

let lastScroll = 0;
const threshold = 15;
const hideAfter = 120;

window.addEventListener(
  "scroll",
  () => {
    if (!header) return;

    const currentScroll = window.scrollY;

    header.classList.toggle("scrolled", currentScroll > 20);

    if (currentScroll < hideAfter) {
      header.classList.remove("hide");
      lastScroll = currentScroll;
      return;
    }

    if (Math.abs(currentScroll - lastScroll) < threshold) return;

    if (currentScroll > lastScroll) {
      header.classList.add("hide");
    } else {
      header.classList.remove("hide");
    }

    lastScroll = currentScroll;
  },
  { passive: true }
);


/* =========================
   REVEAL
========================= */

function addRevealAnimations() {

  // Ting som skal komme inn med en gang siden lastes
  const loadElements = document.querySelectorAll(".reveal-on-load");

  loadElements.forEach((el) => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.classList.add("visible");
      }, 150);
    });
  });


  // Ting som skal komme inn når man scroller
  const elements = document.querySelectorAll(`
    .reveal,
    .home-feature > img,
    .home-feature > div,
    .card,
    .trainer-card,
    .trainer-cta,
    .about-text,
    .gallery-carousel,
    .contact-person,
    .contact-address,
    .contact-map
  `);

  elements.forEach((el) => {
    el.classList.add("reveal");
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -20px 0px"
    }
  );

  elements.forEach((el) => observer.observe(el));
}


/* =========================
   MOBILMENY
========================= */

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");

    menuButton.setAttribute("aria-expanded", String(isOpen));

    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Lukk meny" : "Åpne meny"
    );

    menuButton.textContent = isOpen ? "✕" : "☰";
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");

      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Åpne meny");
      menuButton.textContent = "☰";
    });
  });
}


/* =========================================================
   KARUSELL + KARUSELL-LIGHTBOX
========================================================= */

const track = document.querySelector(".carousel-track");

if (track) {
  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  const originalSlides = [
    ...track.querySelectorAll(".carousel-image-trigger")
  ];

  const originalImages = originalSlides.map((slide) =>
    slide.querySelector("img")
  );

  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = lightbox?.querySelector(".lightbox-image");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  const lightboxPrev = lightbox?.querySelector(".lightbox-prev");
  const lightboxNext = lightbox?.querySelector(".lightbox-next");
  const lightboxCaption = lightbox?.querySelector(".lightbox-caption");

  let currentImage = 0;
  let lastFocusedElement = null;


  /* =========================
     INFINITE KARUSELL
  ========================= */

  const slideCount = originalSlides.length;

  let visualIndex = slideCount;
  let isMoving = false;

  originalSlides.forEach((slide, index) => {
    slide.dataset.originalIndex = index;
  });


  /* Kopier foran */
  if (slideCount > 0) {
    for (let i = slideCount - 1; i >= 0; i--) {
      const clone = originalSlides[i].cloneNode(true);

      clone.classList.add("carousel-clone");
      clone.dataset.originalIndex = i;

      track.prepend(clone);
    }


    /* Kopier bak */
    originalSlides.forEach((slide, index) => {
      const clone = slide.cloneNode(true);

      clone.classList.add("carousel-clone");
      clone.dataset.originalIndex = index;

      track.appendChild(clone);
    });
  }


  function getCarouselStep() {
    const firstSlide =
      track.querySelector(".carousel-image-trigger");

    if (!firstSlide) return 0;

    const styles = getComputedStyle(track);

    const gap =
      parseFloat(styles.columnGap) ||
      parseFloat(styles.gap) ||
      0;

    return (
      firstSlide.getBoundingClientRect().width +
      gap
    );
  }


  function jumpTo(index) {
    const step = getCarouselStep();

    if (!step) return;

    visualIndex = index;

    track.style.scrollBehavior = "auto";
    track.scrollLeft = visualIndex * step;

    requestAnimationFrame(() => {
      track.style.scrollBehavior = "smooth";
    });
  }


  function moveCarousel(direction) {
    if (isMoving || slideCount === 0) return;

    isMoving = true;

    visualIndex += direction;

    const step = getCarouselStep();

    track.scrollTo({
      left: visualIndex * step,
      behavior: "smooth"
    });


    setTimeout(() => {
  if (visualIndex >= slideCount * 2) {
    visualIndex -= slideCount;
    jumpTo(visualIndex);
  }

  else if (visualIndex < slideCount) {
    visualIndex += slideCount;
    jumpTo(visualIndex);
  }

  isMoving = false;

}, 900);
  }


  /* Start på første ekte bilde */
  requestAnimationFrame(() => {
    jumpTo(slideCount);
  });

  /* =========================
   AUTOPLAY
========================= */

let autoplayInterval;

function startAutoplay() {
  stopAutoplay();

  autoplayInterval = setInterval(() => {
    moveCarousel(1);
  }, 4000);
}

function stopAutoplay() {
  clearInterval(autoplayInterval);
}

startAutoplay();


  nextBtn?.addEventListener("click", () => {
  stopAutoplay();
  moveCarousel(1);
  startAutoplay();
});

prevBtn?.addEventListener("click", () => {
  stopAutoplay();
  moveCarousel(-1);
  startAutoplay();
});


  window.addEventListener("resize", () => {
    jumpTo(visualIndex);
  });


  /* =========================
     KARUSELL LIGHTBOX
  ========================= */

  function showCarouselImage(index) {
    if (!originalImages.length || !lightboxImage) return;

    currentImage =
      (index + originalImages.length) %
      originalImages.length;

    const image = originalImages[currentImage];

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    if (lightboxCaption) {
      lightboxCaption.textContent =
        image.dataset.caption || "";
    }
  }


  /*
    Fungerer både på originale bilder
    og kopiene i infinite-karusellen
  */
  track.addEventListener("click", (event) => {
    const trigger =
      event.target.closest(".carousel-image-trigger");

    if (!trigger || !lightbox) return;

    const originalIndex =
      Number(trigger.dataset.originalIndex);

    if (!Number.isInteger(originalIndex)) return;

    lastFocusedElement = trigger;

    showCarouselImage(originalIndex);

    lightbox.classList.add("open");

    lightboxClose?.focus();
  });


  function closeCarouselLightbox() {
    lightbox?.classList.remove("open");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }


  lightboxClose?.addEventListener(
    "click",
    closeCarouselLightbox
  );


  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeCarouselLightbox();
    }
  });


  lightboxNext?.addEventListener("click", () => {
    showCarouselImage(currentImage + 1);
  });


  lightboxPrev?.addEventListener("click", () => {
    showCarouselImage(currentImage - 1);
  });


  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("open")) return;

    if (event.key === "Escape") {
      closeCarouselLightbox();
    }

    if (event.key === "ArrowRight") {
      showCarouselImage(currentImage + 1);
    }

    if (event.key === "ArrowLeft") {
      showCarouselImage(currentImage - 1);
    }
  });
}


/* =========================================================
   FASILITETSBILDER + LIGHTBOX
========================================================= */

const expandableTriggers = [
  ...document.querySelectorAll( ".expandable-image-trigger, .expandable-image:not(.expandable-image-trigger .expandable-image)")
];

const imageLightbox =
  document.querySelector("#imageLightbox");


if (expandableTriggers.length && imageLightbox) {

  const lightboxPhoto =
    imageLightbox.querySelector(".image-lightbox-photo");

  const lightboxCaption =
    imageLightbox.querySelector(".image-lightbox-caption");

  const closeButton =
    imageLightbox.querySelector(".image-lightbox-close");

  const prevButton =
    imageLightbox.querySelector(".image-lightbox-prev");

  const nextButton =
    imageLightbox.querySelector(".image-lightbox-next");


  let currentIndex = 0;
  let lastFocusedElement = null;


  /* =========================
     VIS BILDE
  ========================= */

  function showImage(index) {

    currentIndex =
      (index + expandableTriggers.length) %
      expandableTriggers.length;

    const trigger =
      expandableTriggers[currentIndex];

    const image = trigger.matches(".expandable-image")
  ? trigger
  : trigger.querySelector(".expandable-image");

    const card =
      trigger.closest(".card");

    const title =
      card?.querySelector("h3");

    if (!image || !lightboxPhoto) return;


    lightboxPhoto.src = image.src;
    lightboxPhoto.alt = image.alt;


    if (lightboxCaption) {
      lightboxCaption.textContent =
        title?.textContent || "";
    }
  }


  /* =========================
     ÅPNE
  ========================= */

  expandableTriggers.forEach((trigger, index) => {

    trigger.addEventListener("click", () => {

      lastFocusedElement = trigger;

      showImage(index);

      imageLightbox.classList.add("open");

      closeButton?.focus();
    });

  });


  /* =========================
     LUKK
  ========================= */

  function closeImageLightbox() {

    imageLightbox.classList.remove("open");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }


  closeButton?.addEventListener(
    "click",
    closeImageLightbox
  );


  imageLightbox.addEventListener("click", (event) => {

    if (event.target === imageLightbox) {
      closeImageLightbox();
    }

  });


  /* =========================
     NESTE / FORRIGE
  ========================= */

  nextButton?.addEventListener("click", () => {
    showImage(currentIndex + 1);
  });


  prevButton?.addEventListener("click", () => {
    showImage(currentIndex - 1);
  });


  /* =========================
     TASTATUR
  ========================= */

  document.addEventListener("keydown", (event) => {

    if (!imageLightbox.classList.contains("open")) {
      return;
    }

    if (event.key === "Escape") {
      closeImageLightbox();
    }

    if (event.key === "ArrowRight") {
      showImage(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      showImage(currentIndex - 1);
    }
  });
}


/* =========================
   START
========================= */

addRevealAnimations();
updateHeader();
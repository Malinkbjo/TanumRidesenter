const header = document.querySelector('.site-header');
const nav = document.querySelector('.nav');
const menuButton = document.querySelector('.menu-button');

function updateHeader() {
  header.classList.toggle('scrolled', window.scrollY > 20);
}

/*header scroll */

let lastScroll = 0;
const threshold = 15;
const hideAfter = 120;

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;

  // Skygge/bakgrunn etter litt scroll
  header.classList.toggle("scrolled", currentScroll > 20);

  // Vis alltid header nær toppen
  if (currentScroll < hideAfter) {
    header.classList.remove("hide");
    lastScroll = currentScroll;
    return;
  }

  // Ignorer små bevegelser
  if (Math.abs(currentScroll - lastScroll) < threshold) return;

  if (currentScroll > lastScroll) {
    // Scroller ned
    header.classList.add("hide");
  } else {
    // Scroller opp
    header.classList.remove("hide");
  }

  lastScroll = currentScroll;
});

function addRevealAnimations() {
  const elements = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach(el => observer.observe(el));
}

menuButton.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');

  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute(
    'aria-label',
    isOpen ? 'Lukk meny' : 'Åpne meny'
  );

  menuButton.textContent = isOpen ? '✕' : '☰';
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Åpne meny');
    menuButton.textContent = '☰';
  });
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".reveal-on-load").forEach((el) => {
    setTimeout(() => {
      el.classList.add("visible");
    }, 150);
  });
});

const track = document.querySelector(".carousel-track");

if (track) {

  const prevBtn = document.querySelector(".carousel-btn.prev");
  const nextBtn = document.querySelector(".carousel-btn.next");

  const triggers = [
    ...document.querySelectorAll(".carousel-image-trigger")
  ];

  const images = triggers.map(trigger => trigger.querySelector("img"));

  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector(".lightbox-image");
  const lightboxClose = document.querySelector(".lightbox-close");
  const lightboxPrev = document.querySelector(".lightbox-prev");
  const lightboxNext = document.querySelector(".lightbox-next");
  const lightboxCaption = document.querySelector(".lightbox-caption");

  let currentImage = 0;
  let lastFocusedElement = null;


  /* =========================
     KARUSELL
  ========================= */

let carouselIndex = 0;

function getCenteredImageIndex() {
  const trackCenter =
    track.scrollLeft + track.clientWidth / 2;

  let closestIndex = 0;
  let closestDistance = Infinity;

  triggers.forEach((trigger, index) => {
    const imageCenter =
      trigger.offsetLeft + trigger.offsetWidth / 2;

    const distance =
      Math.abs(imageCenter - trackCenter);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}


function scrollToCarouselImage(index) {
  carouselIndex =
    (index + triggers.length) % triggers.length;

  triggers[carouselIndex].scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center"
  });
}


nextBtn.addEventListener("click", () => {
  const currentIndex = getCenteredImageIndex();

  scrollToCarouselImage(currentIndex + 1);
});


prevBtn.addEventListener("click", () => {
  const currentIndex = getCenteredImageIndex();

  scrollToCarouselImage(currentIndex - 1);
});




  /* =========================
     VIS BILDE
  ========================= */

  function showLightboxImage(index) {
  currentImage = (index + images.length) % images.length;

  const image = images[currentImage];

  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.dataset.caption || "";
}


  /* =========================
     ÅPNE LIGHTBOX
  ========================= */

  triggers.forEach((trigger, index) => {

    trigger.addEventListener("click", () => {

      lastFocusedElement = trigger;

      showLightboxImage(index);

      lightbox.classList.add("open");

      /* flytt fokus til lukk-knappen */
      lightboxClose.focus();
    });

  });


  /* =========================
     LUKK LIGHTBOX
  ========================= */

  function closeLightbox() {

    lightbox.classList.remove("open");

    /* returner fokus til bildet som åpnet lightboxen */
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });


  /* =========================
     NESTE / FORRIGE
  ========================= */

  lightboxNext.addEventListener("click", () => {
    showLightboxImage(currentImage + 1);
  });

  lightboxPrev.addEventListener("click", () => {
    showLightboxImage(currentImage - 1);
  });


  /* =========================
     TASTATUR
  ========================= */

  document.addEventListener("keydown", (event) => {

    if (!lightbox.classList.contains("open")) return;


    /* Escape lukker */
    if (event.key === "Escape") {
      closeLightbox();
    }


    /* Piltaster blar */
    if (event.key === "ArrowRight") {
      showLightboxImage(currentImage + 1);
    }

    if (event.key === "ArrowLeft") {
      showLightboxImage(currentImage - 1);
    }


    /* Hold Tab inne i lightboxen */
    if (event.key === "Tab") {

      const focusableElements = [
        lightboxClose,
        lightboxPrev,
        lightboxNext
      ];

      const firstElement = focusableElements[0];
      const lastElement =
        focusableElements[focusableElements.length - 1];


      /* Shift + Tab fra første → siste */
      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      }

      /* Tab fra siste → første */
      else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

  });

}

const expandableTriggers = [
  ...document.querySelectorAll(".expandable-image-trigger")
];

const imageLightbox = document.querySelector("#imageLightbox");

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

    const trigger = expandableTriggers[currentIndex];

    const image =
      trigger.querySelector(".expandable-image");

    const card = trigger.closest(".card");

    const title = card.querySelector("h3");


    lightboxPhoto.src = image.src;
    lightboxPhoto.alt = image.alt;

    lightboxCaption.textContent = title.textContent;
  }


  /* =========================
     ÅPNE
  ========================= */

  expandableTriggers.forEach((trigger, index) => {

    trigger.addEventListener("click", () => {

      /* husk bildet som åpnet lightboxen */
      lastFocusedElement = trigger;

      showImage(index);

      imageLightbox.classList.add("open");

      /* flytt fokus til X */
      closeButton.focus();
    });

  });


  /* =========================
     LUKK
  ========================= */

  function closeImageLightbox() {

    imageLightbox.classList.remove("open");

    /* tilbake til bildet som åpnet lightboxen */
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  closeButton.addEventListener(
    "click",
    closeImageLightbox
  );


  /* Klikk på mørk bakgrunn */
  imageLightbox.addEventListener("click", (event) => {

    if (event.target === imageLightbox) {
      closeImageLightbox();
    }

  });


  /* =========================
     NESTE / FORRIGE
  ========================= */

  nextButton.addEventListener("click", () => {
    showImage(currentIndex + 1);
  });

  prevButton.addEventListener("click", () => {
    showImage(currentIndex - 1);
  });


  /* =========================
     TASTATUR
  ========================= */

  document.addEventListener("keydown", (event) => {

    if (!imageLightbox.classList.contains("open")) return;


    /* Escape lukker */
    if (event.key === "Escape") {
      closeImageLightbox();
    }


    /* Piltaster */
    if (event.key === "ArrowRight") {
      showImage(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      showImage(currentIndex - 1);
    }


    /* Hold Tab inne i lightboxen */
    if (event.key === "Tab") {

      const focusableElements = [
        closeButton,
        prevButton,
        nextButton
      ];

      const firstElement = focusableElements[0];

      const lastElement =
        focusableElements[focusableElements.length - 1];


      if (
        event.shiftKey &&
        document.activeElement === firstElement
      ) {
        event.preventDefault();
        lastElement.focus();
      }

      else if (
        !event.shiftKey &&
        document.activeElement === lastElement
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

  });

}

window.addEventListener('scroll', updateHeader, { passive: true });
addRevealAnimations();
updateHeader();


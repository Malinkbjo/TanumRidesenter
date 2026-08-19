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

/* =========================
   KARUSELL – INFINITE LOOP
========================= */

const originalSlides = [...triggers];
const slideCount = originalSlides.length;

let visualIndex = slideCount;
let isMoving = false;


/* Lager én kopi av alle bildene foran og bak */
originalSlides.forEach((slide, index) => {
  slide.dataset.originalIndex = index;
});

for (let i = slideCount - 1; i >= 0; i--) {
  const clone = originalSlides[i].cloneNode(true);

  clone.classList.add("carousel-clone");
  clone.dataset.originalIndex = i;

  track.prepend(clone);
}

originalSlides.forEach((slide, index) => {
  const clone = slide.cloneNode(true);

  clone.classList.add("carousel-clone");
  clone.dataset.originalIndex = index;

  track.appendChild(clone);
});


/* Alle slides: kopier + ekte bilder + kopier */
const allSlides = [
  ...track.querySelectorAll(".carousel-image-trigger")
];


function getCarouselStep() {
  const firstSlide = allSlides[0];

  if (!firstSlide) return 0;

  const styles = getComputedStyle(track);

  const gap =
    parseFloat(styles.columnGap) ||
    parseFloat(styles.gap) ||
    0;

  return firstSlide.getBoundingClientRect().width + gap;
}


/* Flytt uten animasjon */
function jumpTo(index) {
  visualIndex = index;

  const step = getCarouselStep();

  track.style.scrollBehavior = "auto";
  track.scrollLeft = visualIndex * step;

  requestAnimationFrame(() => {
    track.style.scrollBehavior = "smooth";
  });
}


/* Start på første EKTE bilde */
requestAnimationFrame(() => {
  jumpTo(slideCount);
});


function moveCarousel(direction) {
  if (isMoving) return;

  isMoving = true;
  visualIndex += direction;

  const step = getCarouselStep();

  track.scrollTo({
    left: visualIndex * step,
    behavior: "smooth"
  });


  /*
    Når vi har bladd inn i kopiene,
    hopper vi usynlig tilbake til tilsvarende ekte bilde.
  */
  setTimeout(() => {

    /* Kopiene etter siste ekte bilde */
    if (visualIndex >= slideCount * 2) {
      visualIndex -= slideCount;
      jumpTo(visualIndex);
    }

    /* Kopiene før første ekte bilde */
    else if (visualIndex < slideCount) {
      visualIndex += slideCount;
      jumpTo(visualIndex);
    }

    isMoving = false;

  }, 450);
}


nextBtn.addEventListener("click", () => {
  moveCarousel(1);
});


prevBtn.addEventListener("click", () => {
  moveCarousel(-1);
});


/* Behold riktig plassering når skjermen endrer størrelse */
window.addEventListener("resize", () => {
  jumpTo(visualIndex);
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


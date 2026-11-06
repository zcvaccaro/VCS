const SITE = window.SITE || {
  phoneDisplay: "",
  phoneTel: "",
  email: "",
  serviceArea: "",
};

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLabel = document.querySelector(".nav-toggle-label");
const year = document.querySelector("#year");

if (year) year.textContent = String(new Date().getFullYear());

function applySite() {
  document.querySelectorAll("[data-if]").forEach((el) => {
    const key = el.getAttribute("data-if");
    const value = key === "phone" ? SITE.phoneTel || SITE.phoneDisplay : SITE[key];
    if (!value) el.remove();
  });

  document.querySelectorAll('[data-fill="phone"]').forEach((el) => {
    el.textContent = SITE.phoneDisplay || SITE.phoneTel;
    if (el.tagName === "A") el.href = `tel:${SITE.phoneTel || SITE.phoneDisplay}`;
  });

  document.querySelectorAll('[data-fill="email"]').forEach((el) => {
    el.textContent = SITE.email;
    if (el.tagName === "A") el.href = `mailto:${SITE.email}`;
  });

  document.querySelectorAll('[data-fill="serviceArea"]').forEach((el) => {
    el.textContent = SITE.serviceArea;
  });

  const hint = document.querySelector(".form-hint");
  if (hint && SITE.email) {
    hint.textContent = `This sends your note to ${SITE.email}.`;
  }
}

applySite();

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 8);
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

document.querySelector(".brand")?.addEventListener("click", (event) => {
  event.preventDefault();
  const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  window.scrollTo({ top: 0, left: 0, behavior });
});

const homeowner = document.querySelector('#inquiry input[name="role"][value="Homeowner"]');
if (homeowner) homeowner.checked = true;

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navLabel.textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("nav-open", open);
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navLabel.textContent = "Menu";
      document.body.classList.remove("nav-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open")) {
      header.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navLabel.textContent = "Menu";
      document.body.classList.remove("nav-open");
      navToggle.focus();
    }
  });
}

const reels = [...document.querySelectorAll("[data-reel]")];
const reelTabs = [...document.querySelectorAll("[data-reel-tab]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dialog = document.querySelector(".lightbox");

reels.forEach((reel) => {
  const slides = [...reel.querySelectorAll(".reel-slide")];
  const title = reel.querySelector(".reel-title");
  const text = reel.querySelector(".reel-text");
  const count = reel.querySelector(".reel-count");
  const dots = reel.querySelector(".reel-dots");
  let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let timer = 0;

  slides.forEach((slide, slideIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "reel-dot";
    dot.setAttribute("aria-label", `Show ${slide.dataset.title || `photo ${slideIndex + 1}`}`);
    dot.addEventListener("click", () => {
      go(slideIndex);
      restart();
    });
    dots.appendChild(dot);
  });

  function render() {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    const active = slides[index];
    if (!active) return;
    title.textContent = active.dataset.title || "";
    text.textContent = active.dataset.caption || "";
    count.textContent = `${index + 1} / ${slides.length}`;
    [...dots.children].forEach((dot, dotIndex) => {
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }

  function go(next) {
    index = (next + slides.length) % slides.length;
    render();
  }

  function stop() {
    window.clearInterval(timer);
  }

  function restart() {
    stop();
    if (reduceMotion) return;
    timer = window.setInterval(() => {
      if (reel.hidden || document.hidden || dialog?.open) return;
      go(index + 1);
    }, 5500);
  }

  reel.querySelector(".reel-next")?.addEventListener("click", () => {
    go(index + 1);
    restart();
  });
  reel.querySelector(".reel-prev")?.addEventListener("click", () => {
    go(index - 1);
    restart();
  });
  reel.addEventListener("mouseenter", stop);
  reel.addEventListener("mouseleave", restart);
  reel.addEventListener("focusin", stop);
  reel.addEventListener("focusout", (event) => {
    if (!reel.contains(event.relatedTarget)) restart();
  });

  render();
  restart();
});

reelTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    reelTabs.forEach((item) => item.setAttribute("aria-pressed", "false"));
    tab.setAttribute("aria-pressed", "true");
    reels.forEach((reel) => {
      reel.hidden = reel.dataset.reel !== tab.dataset.reelTab;
    });
  });
});

const lightboxImg = document.querySelector("#lightbox-img");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxCaption = document.querySelector("#lightbox-caption");
const lightboxCount = document.querySelector("#lightbox-count");
let photoIndex = 0;

function visiblePhotos() {
  return [...document.querySelectorAll(".js-photo")].filter((el) => !el.closest("[hidden]"));
}

function showPhoto(index) {
  const photos = visiblePhotos();
  if (!photos.length) return;
  photoIndex = (index + photos.length) % photos.length;
  const photo = photos[photoIndex];
  const img = photo.querySelector("img");
  lightboxImg.src = img.currentSrc || img.src;
  lightboxImg.alt = photo.dataset.title || "";
  lightboxTitle.textContent = photo.dataset.title || "";
  lightboxCaption.textContent = photo.dataset.caption || "";
  lightboxCount.textContent = `${photoIndex + 1} / ${photos.length}`;
}

function openPhoto(photo) {
  const photos = visiblePhotos();
  const index = photos.indexOf(photo);
  showPhoto(index < 0 ? 0 : index);
  if (!dialog.open) dialog.showModal();
}

document.querySelectorAll(".js-photo").forEach((photo) => {
  photo.addEventListener("click", () => openPhoto(photo));
});

document.querySelector(".lightbox-close")?.addEventListener("click", () => dialog.close());
document.querySelector(".lightbox-prev")?.addEventListener("click", () => showPhoto(photoIndex - 1));
document.querySelector(".lightbox-next")?.addEventListener("click", () => showPhoto(photoIndex + 1));

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog || event.target.classList.contains("lightbox-stage")) dialog.close();
});

dialog?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    showPhoto(photoIndex - 1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showPhoto(photoIndex + 1);
  }
});

const form = document.querySelector("#inquiry");
const success = document.querySelector(".form-success");
const successLead = document.querySelector(".success-lead");
const successText = document.querySelector("#inquiry-copy");
const copyButton = document.querySelector("#copy-inquiry");
const anotherButton = document.querySelector("#another-inquiry");

function fieldError(id, message) {
  const field = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  if (!field || !error) return;
  if (message) {
    field.setAttribute("aria-invalid", "true");
    error.hidden = false;
    error.textContent = message;
  } else {
    field.removeAttribute("aria-invalid");
    error.hidden = true;
    error.textContent = "";
  }
}

function composeInquiry(data) {
  return [
    `Name: ${data.name}`,
    `Phone: ${data.phone || "—"}`,
    `Email: ${data.email || "—"}`,
    `I am a: ${data.role}`,
    `Project: ${data.project}`,
    `Where: ${data.place || "—"}`,
    `Best way to reach me: ${data.reach}`,
    "",
    data.message,
  ].join("\n");
}

function showSuccess(text, mode) {
  form.hidden = true;
  success.hidden = false;
  successText.value = text;
  if (mode === "sent") {
    successLead.textContent = `Thanks. Your note is on its way to ${SITE.email}.`;
  } else if (mode === "mailto" && SITE.email) {
    successLead.textContent = `If your email app opened, send the message waiting there. You can also copy it and email ${SITE.email}.`;
  } else {
    successLead.textContent = `Copy this note and email it to ${SITE.email || "Vaccaro Construction Services"}.`;
  }
  success.querySelector("h3")?.focus();
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));

  if (String(data.company || "").trim()) {
    showSuccess("", "sent");
    return;
  }

  const name = String(data.name || "").trim();
  const phone = String(data.phone || "").trim();
  const email = String(data.email || "").trim();
  const project = String(data.project || "").trim();
  const message = String(data.message || "").trim();
  const phoneDigits = phone.replace(/\D/g, "");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  fieldError("name", name.length < 2 ? "Add your name." : "");
  fieldError("phone", phone && phoneDigits.length < 7 ? "That phone number looks short." : "");
  fieldError("email", email && !emailOk ? "That email looks off." : "");
  fieldError("project", project ? "" : "Choose a project type.");
  fieldError("message", message.length < 8 ? "Say a little about the job." : "");

  const contactError = document.getElementById("contact-method-error");
  const missingContact = !phone && !email;
  contactError.hidden = !missingContact;
  contactError.textContent = missingContact ? "Add a phone number or an email so I can reply." : "";

  const invalid = name.length < 2 || (phone && phoneDigits.length < 7) || (email && !emailOk) || !project || message.length < 8 || missingContact;
  if (invalid) {
    const firstInvalid = form.querySelector("[aria-invalid='true']") || contactError;
    firstInvalid?.focus?.();
    return;
  }

  const inquiry = {
    name,
    phone,
    email,
    role: data.role || "Homeowner",
    project,
    place: String(data.place || "").trim(),
    reach: data.reach || "Phone",
    message,
  };
  const text = composeInquiry(inquiry);

  let sent = false;
  try {
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    });
    sent = response.ok;
  } catch {
    sent = false;
  }

  if (sent) {
    showSuccess(text, "sent");
    return;
  }

  if (SITE.email) {
    const subject = `Project inquiry from ${name}`;
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    showSuccess(text, "mailto");
    return;
  }

  showSuccess(text, "copy");
});

copyButton?.addEventListener("click", async () => {
  const text = successText.value;
  try {
    await navigator.clipboard.writeText(text);
    copyButton.textContent = "Copied";
  } catch {
    successText.focus();
    successText.select();
    copyButton.textContent = "Select the note and copy it";
  }
});

anotherButton?.addEventListener("click", () => {
  form.reset();
  form.hidden = false;
  success.hidden = true;
  copyButton.textContent = "Copy inquiry";
  form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  form.querySelectorAll(".field-error").forEach((el) => {
    el.hidden = true;
    el.textContent = "";
  });
  document.getElementById("name")?.focus();
});

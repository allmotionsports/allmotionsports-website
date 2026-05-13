(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");
  var navLinks = document.querySelectorAll(".site-nav a");

  function closeNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  }

  function toggleNav() {
    if (!navToggle || !siteNav) return;
    var open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    siteNav.classList.toggle("is-open", !open);
    document.body.classList.toggle("nav-open", !open);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", toggleNav);
    navLinks.forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var form = document.getElementById("registration-form");
  var successEl = document.getElementById("form-success");

  if (form && successEl) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      successEl.style.background = "";
      successEl.style.color = "";
      successEl.style.borderColor = "";

      var parentName = document.getElementById("parentName");
      var childName = document.getElementById("childName");
      var childAge = document.getElementById("childAge");
      var email = document.getElementById("email");
      var phone = document.getElementById("phone");
      var program = form.querySelector('input[name="program"]:checked');

      if (!parentName || !childName || !childAge || !email || !phone) return;

      if (!parentName.value.trim() || !childName.value.trim()) {
        successEl.hidden = false;
        successEl.style.background = "rgba(196, 30, 58, 0.1)";
        successEl.style.color = "#8b1530";
        successEl.style.borderColor = "rgba(196, 30, 58, 0.25)";
        successEl.textContent = "Please fill in all required fields.";
        return;
      }

      var age = parseInt(childAge.value, 10);
      if (isNaN(age) || age < 6 || age > 14) {
        successEl.hidden = false;
        successEl.style.background = "rgba(196, 30, 58, 0.1)";
        successEl.style.color = "#8b1530";
        successEl.style.borderColor = "rgba(196, 30, 58, 0.25)";
        successEl.textContent = "Child age must be between 6 and 14.";
        return;
      }

      if (!email.validity.valid || !email.value.trim()) {
        successEl.hidden = false;
        successEl.style.background = "rgba(196, 30, 58, 0.1)";
        successEl.style.color = "#8b1530";
        successEl.style.borderColor = "rgba(196, 30, 58, 0.25)";
        successEl.textContent = "Please enter a valid email address.";
        return;
      }

      if (!phone.value.trim()) {
        successEl.hidden = false;
        successEl.style.background = "rgba(196, 30, 58, 0.1)";
        successEl.style.color = "#8b1530";
        successEl.style.borderColor = "rgba(196, 30, 58, 0.25)";
        successEl.textContent = "Please enter a phone number.";
        return;
      }

      if (!program) {
        successEl.hidden = false;
        successEl.style.background = "rgba(196, 30, 58, 0.1)";
        successEl.style.color = "#8b1530";
        successEl.style.borderColor = "rgba(196, 30, 58, 0.25)";
        successEl.textContent = "Please select a program.";
        return;
      }

      successEl.style.background = "rgba(34, 139, 34, 0.1)";
      successEl.style.color = "#1a5c1a";
      successEl.style.borderColor = "rgba(34, 139, 34, 0.25)";
      successEl.hidden = false;
      successEl.textContent =
        "Thank you! Your registration details have been recorded. We will contact you at " +
        email.value.trim() +
        " shortly.";

      form.reset();
      successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  var lightbox = document.getElementById("gallery-lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".gallery-lightbox-img") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".gallery-lightbox-close") : null;
  var galleryTriggers = document.querySelectorAll("[data-gallery-open]");
  var galleryFocusReturn = null;

  if (lightbox && lightboxImg && lightboxClose && galleryTriggers.length && typeof lightbox.showModal === "function") {
    lightbox.addEventListener("close", function () {
      if (galleryFocusReturn) {
        galleryFocusReturn.focus();
        galleryFocusReturn = null;
      }
      lightboxImg.removeAttribute("src");
      lightboxImg.alt = "";
    });

    galleryTriggers.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var img = btn.querySelector("img");
        if (!img || !img.src) return;
        galleryFocusReturn = btn;
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || "";
        lightbox.showModal();
        lightboxClose.focus();
      });
    });

    lightboxClose.addEventListener("click", function () {
      lightbox.close();
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) lightbox.close();
    });
  }

  var revealTargets = document.querySelectorAll(".section-header, .program-card, .about-inner, .registration-form, .contact-grid");
  revealTargets.forEach(function (el) {
    el.classList.add("reveal");
  });

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();

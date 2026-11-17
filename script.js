const imageUrl = "https://picsum.photos/300";
const STORAGE_KEY = "storedImages";
const UNSPLASH_KEY = "_l5pONNAJqKGTXDZKGC4IzZP4UWZH38ydMWt0wGC1fI";

const imageSection = document.getElementById("imageSection");
const addImageBtn = document.getElementById("addImageBtn");
const searchForm = document.querySelector(".searchImage");
const searchInput = searchForm.querySelector('input[type="search"]');
const countInput = document.getElementById("countInput");

/*  FULLSCREEN ELEMENTS  */
const overlay = document.getElementById("fullscreenOverlay");
const fsImage = document.getElementById("fullscreenImage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const playBtn = document.getElementById("playBtn");
const closeBtn = document.getElementById("closeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const deleteBtn = document.getElementById("deleteBtn");

let currentIndex = 0;
let slideshowInterval = null;

/*  CLICK OUTSIDE IMAGE & CONTROLS TO CLOSE FULLSCREEN  */
overlay.addEventListener("click", () => {
  closeFullscreen();
});

/*  PREVENT CLOSING WHEN CLICKING ON IMAGE OR BUTTONS  */
fsImage.addEventListener("click", (e) => e.stopPropagation());
document.querySelector(".fs-controls").addEventListener("click", (e) =>
  e.stopPropagation()
);

/*  LOAD  */
document.addEventListener("DOMContentLoaded", loadImages);
addImageBtn.addEventListener("click", addRandomImage);
searchForm.addEventListener("submit", handleSearch);

function loadImages() {
  imageSection.innerHTML = "";
  getImages().forEach((src, index) => renderImage(src, index));
}

/*  ADD RANDOM  */
async function addRandomImage() {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const base64 = await blobToBase64(blob);
  saveImage(base64);
}

/*  SEARCH  */
async function handleSearch(e) {
  e.preventDefault();
  if (!searchInput.value.trim()) return;

  const url = `https://api.unsplash.com/search/photos?query=${searchInput.value}&per_page=${countInput.value}&client_id=${UNSPLASH_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  for (const photo of data.results) {
    const imgRes = await fetch(photo.urls.small);
    const blob = await imgRes.blob();
    const base64 = await blobToBase64(blob);
    saveImage(base64);
  }
}

/*  STORAGE  */
function getImages() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveImage(img) {
  const images = getImages();
  images.push(img);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  loadImages();
}

/*  RENDER  */
function renderImage(src, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "imageCard";

  const card = document.createElement("div");
  card.className = "card";

  const img = document.createElement("img");
  img.src = src;
  img.onclick = () => openFullscreen(index);

  card.appendChild(img);
  wrapper.appendChild(card);
  imageSection.appendChild(wrapper);
}

/*  FULLSCREEN  */
function openFullscreen(index) {
  currentIndex = index;
  fsImage.src = getImages()[currentIndex];
  overlay.style.display = "flex";
}

function closeFullscreen() {
  overlay.style.display = "none";
  stopSlideshow();
}

function showNext() {
  const images = getImages();
  currentIndex = (currentIndex + 1) % images.length;
  fsImage.src = images[currentIndex];
}

function showPrev() {
  const images = getImages();
  currentIndex = (currentIndex - 1 + images.length) % images.length;
  fsImage.src = images[currentIndex];
}

/*  SLIDESHOW  */
function startSlideshow() {
  playBtn.textContent = "⏸";
  slideshowInterval = setInterval(showNext, 2000);
}

function stopSlideshow() {
  playBtn.textContent = "▶️";
  clearInterval(slideshowInterval);
  slideshowInterval = null;
}

/*  DOWNLOAD & DELETE (FULLSCREEN)  */
deleteBtn.onclick = () => {
  let images = getImages();

  // Remove current image
  images.splice(currentIndex, 1);

  // Save updated images
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));

  // Reload gallery
  loadImages();

  // If no images left → close fullscreen
  if (images.length === 0) {
    closeFullscreen();
    return;
  }

  // Fix index if out of bounds
  if (currentIndex >= images.length) {
    currentIndex = images.length - 1;
  }

  // Show next image in fullscreen
  fsImage.src = images[currentIndex];
};
downloadBtn.onclick = () => {
  const link = document.createElement("a");
  link.href = fsImage.src;
  link.download = `image_${currentIndex + 1}.jpg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/*  EVENTS  */
nextBtn.onclick = showNext;
prevBtn.onclick = showPrev;
closeBtn.onclick = closeFullscreen;
playBtn.onclick = () =>
  slideshowInterval ? stopSlideshow() : startSlideshow();

/*  UTIL  */
function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

/*  KEYBOARD SHORTCUTS  */
document.addEventListener("keydown", (e) => {
  if (overlay.style.display !== "flex") return;

  switch (e.key) {
    case "Escape":
      closeFullscreen();
      e.preventDefault();
      break;

    case "ArrowRight":
      showNext();
      e.preventDefault();
      break;

    case "ArrowLeft":
      showPrev();
      e.preventDefault();
      break;

    case "Delete":
      deleteBtn.click();
      e.preventDefault();
      break;
  }
});

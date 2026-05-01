// 입문자를 위한 기본 명언 데이터: 20개 이상 제공
const QUOTES = [
  { text: "성공은 매일 반복한 작은 노력의 합이다.", author: "Robert Collier" },
  { text: "오늘 걷지 않으면 내일은 뛰어야 한다.", author: "Unknown" },
  { text: "포기하지 않는다면 실패도 과정이다.", author: "Unknown" },
  { text: "배움에는 끝이 없다.", author: "Leonardo da Vinci" },
  { text: "시작이 가장 중요한 부분이다.", author: "Plato" },
  { text: "행동은 모든 성공의 기본 열쇠다.", author: "Pablo Picasso" },
  { text: "어제보다 나은 오늘이면 충분하다.", author: "Unknown" },
  { text: "기회는 준비된 사람에게 온다.", author: "Louis Pasteur" },
  { text: "작은 진전도 진전이다.", author: "Unknown" },
  { text: "꾸준함이 재능을 이긴다.", author: "Unknown" },
  { text: "문제는 해결을 기다리는 질문이다.", author: "Unknown" },
  { text: "두려움은 도전의 신호다.", author: "Unknown" },
  { text: "실패는 다시 시작할 수 있는 기회다.", author: "Henry Ford" },
  { text: "할 수 있다고 믿는 순간 절반은 이룬 것이다.", author: "Theodore Roosevelt" },
  { text: "오늘의 선택이 내일의 습관이 된다.", author: "Unknown" },
  { text: "계획 없는 목표는 소원에 불과하다.", author: "Antoine de Saint-Exupery" },
  { text: "천천히 가도 멈추지만 않으면 된다.", author: "Confucius" },
  { text: "좋은 코드는 좋은 습관에서 나온다.", author: "Unknown" },
  { text: "비교 대신 성장에 집중하라.", author: "Unknown" },
  { text: "반복은 실력을 만든다.", author: "Unknown" },
  { text: "완벽보다 완성이 먼저다.", author: "Unknown" }
];

const STORAGE_KEYS = {
  favorites: "quote-app.favorites",
  theme: "quote-app.theme",
  myQuotes: "quote-app.myQuotes"
};

const quoteStage = document.getElementById("quoteStage");
const quoteTextEl = document.getElementById("quoteText");
const quoteAuthorEl = document.getElementById("quoteAuthor");
const nextBtn = document.getElementById("nextBtn");
const copyBtn = document.getElementById("copyBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const favoriteInfoEl = document.getElementById("favoriteInfo");
const statusMessageEl = document.getElementById("statusMessage");
const lightThemeBtn = document.getElementById("lightThemeBtn");
const darkThemeBtn = document.getElementById("darkThemeBtn");
const addQuoteForm = document.getElementById("addQuoteForm");
const myQuoteTextEl = document.getElementById("myQuoteText");
const myQuoteAuthorEl = document.getElementById("myQuoteAuthor");

let favorites = loadFavorites();
let myQuotes = loadMyQuotes();
let allQuotes = [...QUOTES, ...myQuotes];
let currentQuote = null;
let currentIndex = -1;

// 초기 렌더링: 데이터가 비어 있어도 안전하게 처리
applySavedTheme();
showRandomQuote(true);
updateFavoriteInfo();

nextBtn.addEventListener("click", () => showRandomQuote(false));
copyBtn.addEventListener("click", copyCurrentQuote);
favoriteBtn.addEventListener("click", toggleFavorite);
lightThemeBtn.addEventListener("click", () => setTheme("light"));
darkThemeBtn.addEventListener("click", () => setTheme("dark"));
addQuoteForm.addEventListener("submit", handleAddQuote);

function showRandomQuote(skipFade) {
  if (!Array.isArray(allQuotes) || allQuotes.length === 0) {
    renderQuote({ text: "표시할 명언 데이터가 없습니다.", author: "시스템" }, true);
    nextBtn.disabled = true;
    copyBtn.disabled = true;
    favoriteBtn.disabled = true;
    return;
  }

  const nextIndex = getRandomIndex(allQuotes.length, currentIndex);
  currentIndex = nextIndex;
  currentQuote = allQuotes[nextIndex];

  renderQuote(currentQuote, skipFade);
  updateFavoriteButtonState();
}

function getRandomIndex(max, excludedIndex) {
  if (max <= 1) return 0;

  let randomIndex = Math.floor(Math.random() * max);
  while (randomIndex === excludedIndex) {
    randomIndex = Math.floor(Math.random() * max);
  }
  return randomIndex;
}

function renderQuote(quote, skipFade = false) {
  if (skipFade) {
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `- ${quote.author} -`;
    return;
  }

  quoteStage.classList.add("fading");
  window.setTimeout(() => {
    quoteTextEl.textContent = `"${quote.text}"`;
    quoteAuthorEl.textContent = `- ${quote.author} -`;
    quoteStage.classList.remove("fading");
  }, 150);
}

async function copyCurrentQuote() {
  if (!currentQuote) {
    setStatusMessage("복사할 명언이 없습니다.");
    return;
  }

  const textToCopy = `"${currentQuote.text}" - ${currentQuote.author}`;

  try {
    await navigator.clipboard.writeText(textToCopy);
    setStatusMessage("명언을 복사했습니다.");
  } catch (error) {
    setStatusMessage("복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
  }
}

function toggleFavorite() {
  if (!currentQuote) return;

  const key = quoteKey(currentQuote);
  const index = favorites.findIndex((item) => quoteKey(item) === key);

  if (index >= 0) {
    favorites.splice(index, 1);
    setStatusMessage("즐겨찾기에서 삭제했습니다.");
  } else {
    favorites.push(currentQuote);
    setStatusMessage("즐겨찾기에 저장했습니다.");
  }

  saveFavorites(favorites);
  updateFavoriteButtonState();
  updateFavoriteInfo();
}

function updateFavoriteButtonState() {
  if (!currentQuote) return;

  const isFavorite = favorites.some((item) => quoteKey(item) === quoteKey(currentQuote));
  favoriteBtn.classList.toggle("active", isFavorite);
  favoriteBtn.setAttribute("aria-pressed", String(isFavorite));
  favoriteBtn.textContent = isFavorite ? "즐겨찾기 해제" : "즐겨찾기";
}

function updateFavoriteInfo() {
  favoriteInfoEl.textContent = `즐겨찾기 ${favorites.length}개`;
}

function quoteKey(quote) {
  return `${quote.text}::${quote.author}`;
}

function setStatusMessage(message) {
  statusMessageEl.textContent = message;
}

function handleAddQuote(event) {
  event.preventDefault();

  const text = myQuoteTextEl.value.trim();
  const author = myQuoteAuthorEl.value.trim();

  if (!text || !author) {
    setStatusMessage("명언과 저자를 모두 입력해 주세요.");
    return;
  }

  if (text.length < 5) {
    setStatusMessage("명언은 5자 이상 입력해 주세요.");
    return;
  }

  if (author.length < 2) {
    setStatusMessage("저자는 2자 이상 입력해 주세요.");
    return;
  }

  const newQuote = { text, author };
  myQuotes.push(newQuote);
  saveMyQuotes(myQuotes);
  allQuotes = [...QUOTES, ...myQuotes];
  currentIndex = allQuotes.length - 1;
  currentQuote = newQuote;
  renderQuote(newQuote, false);
  updateFavoriteButtonState();
  addQuoteForm.reset();
  setStatusMessage("내 명언이 추가되었습니다.");
}

function loadFavorites() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEYS.favorites);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.text === "string" && typeof item.author === "string");
  } catch (error) {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(list));
}

function loadMyQuotes() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEYS.myQuotes);
    if (!rawValue) return [];
    const parsed = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.text === "string" && typeof item.author === "string");
  } catch (error) {
    return [];
  }
}

function saveMyQuotes(list) {
  localStorage.setItem(STORAGE_KEYS.myQuotes, JSON.stringify(list));
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  setTheme(savedTheme === "dark" ? "dark" : "light", false);
}

function setTheme(theme, shouldAnnounce = true) {
  document.body.setAttribute("data-theme", theme);

  const isLight = theme === "light";
  lightThemeBtn.classList.toggle("active", isLight);
  darkThemeBtn.classList.toggle("active", !isLight);
  lightThemeBtn.setAttribute("aria-pressed", String(isLight));
  darkThemeBtn.setAttribute("aria-pressed", String(!isLight));

  localStorage.setItem(STORAGE_KEYS.theme, theme);
  if (shouldAnnounce) {
    setStatusMessage(`${isLight ? "라이트" : "다크"} 테마로 변경했습니다.`);
  }
}

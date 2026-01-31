const config = window.CONFIG || {};

const form = document.getElementById("query-form");
const input = document.getElementById("query-input");
const geminiOutput = document.getElementById("gemini-output");
const googleResults = document.getElementById("google-results");
const claudeOutput = document.getElementById("claude-output");
const chatgptOutput = document.getElementById("chatgpt-output");

const truthBlocks = {
  gemini: document.getElementById("truth-gemini"),
  claude: document.getElementById("truth-claude"),
  chatgpt: document.getElementById("truth-chatgpt")
};

const ratingMap = [
  { match: ["true", "correct", "accurate"], score: 100 },
  { match: ["mostly true", "mostly correct"], score: 85 },
  { match: ["half true", "half-true", "partly true"], score: 60 },
  { match: ["mixed", "partly false", "partly incorrect"], score: 50 },
  { match: ["misleading", "unsupported", "unproven"], score: 35 },
  { match: ["mostly false", "mostly incorrect"], score: 20 },
  { match: ["false", "incorrect", "pants on fire"], score: 5 }
];

const MAX_CLAIM_COUNT = 10;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = input.value.trim();
  if (!query) {
    return;
  }
  runSearch(query);
});

function setStatus(element, message, className = "status") {
  element.innerHTML = `<span class="${className}">${message}</span>`;
}

function setTruthBlockLoading() {
  Object.values(truthBlocks).forEach((block) => {
    block.querySelector("[data-truth-score]").textContent = "--";
    block.querySelector("[data-coverage-score]").textContent = "--";
    block.querySelector("[data-claim-list]").textContent = "Fetching fact checks...";
  });
}

function setTruthBlockError(message) {
  Object.values(truthBlocks).forEach((block) => {
    block.querySelector("[data-truth-score]").textContent = "--";
    block.querySelector("[data-coverage-score]").textContent = "--";
    block.querySelector("[data-claim-list]").textContent = message;
  });
}

function updateTruthBlocks(summary) {
  Object.values(truthBlocks).forEach((block) => {
    block.querySelector("[data-truth-score]").textContent = summary.truthScore;
    block.querySelector("[data-coverage-score]").textContent = summary.coverageScore;
    block.querySelector("[data-claim-list]").innerHTML = summary.claimSummaryHtml;
  });
}

async function runSearch(query) {
  input.disabled = true;
  form.querySelector("button").disabled = true;

  setStatus(geminiOutput, "Loading Gemini response...");
  setStatus(googleResults, "Loading Google results...");
  setStatus(claudeOutput, "Loading Claude response...");
  setStatus(chatgptOutput, "Loading ChatGPT response...");
  setTruthBlockLoading();

  const factCheckPromise = fetchFactChecks(query);
  const geminiPromise = fetchGemini(query);
  const googlePromise = fetchGoogleSearch(query);
  const claudePromise = fetchClaude(query);
  const chatgptPromise = fetchChatGPT(query);

  const [factCheckResult] = await Promise.allSettled([factCheckPromise]);
  if (factCheckResult.status === "fulfilled") {
    updateTruthBlocks(factCheckResult.value);
  } else {
    setTruthBlockError("Fact check unavailable.");
  }

  const [geminiResult, googleResult, claudeResult, chatgptResult] =
    await Promise.allSettled([
      geminiPromise,
      googlePromise,
      claudePromise,
      chatgptPromise
    ]);

  handleResponse(geminiResult, geminiOutput, formatTextResponse);
  handleResponse(googleResult, googleResults, formatGoogleResults);
  handleResponse(claudeResult, claudeOutput, formatTextResponse);
  handleResponse(chatgptResult, chatgptOutput, formatTextResponse);

  input.disabled = false;
  form.querySelector("button").disabled = false;
}

function handleResponse(result, element, formatter) {
  if (result.status === "fulfilled") {
    element.innerHTML = formatter(result.value);
  } else {
    setStatus(element, result.reason.message || "Request failed.", "error");
  }
}

function formatTextResponse(text) {
  return text ? text.replace(/\n/g, "<br />") : "<span class=\"status\">No response.</span>";
}

function formatGoogleResults(items) {
  if (!items || items.length === 0) {
    return "<span class=\"status\">No results.</span>";
  }
  const listItems = items
    .map(
      (item) =>
        `<li><a href="${item.link}" target="_blank" rel="noreferrer">${item.title}</a><br />${item.snippet}</li>`
    )
    .join("");
  return `<ul>${listItems}</ul>`;
}

function ensureConfig(key, label) {
  if (!config[key]) {
    throw new Error(`${label} is not configured in config.js`);
  }
}

async function fetchGoogleSearch(query) {
  ensureConfig("googleApiKey", "Google API key");
  ensureConfig("googleSearchCx", "Google Search CX");

  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", config.googleApiKey);
  url.searchParams.set("cx", config.googleSearchCx);
  url.searchParams.set("q", query);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Google Search request failed.");
  }
  const data = await response.json();
  return data.items || [];
}

async function fetchGemini(query) {
  ensureConfig("geminiApiKey", "Gemini API key");
  const url = new URL(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
  );
  url.searchParams.set("key", config.geminiApiKey);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: query }] }]
    })
  });

  if (!response.ok) {
    throw new Error("Gemini request failed.");
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function fetchChatGPT(query) {
  ensureConfig("openaiApiKey", "OpenAI API key");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.openaiApiKey}`
    },
    body: JSON.stringify({
      model: config.openaiModel || "gpt-4o-mini",
      messages: [{ role: "user", content: query }],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    throw new Error("ChatGPT request failed.");
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function fetchClaude(query) {
  ensureConfig("anthropicApiKey", "Anthropic API key");
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.anthropicApiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: config.anthropicModel || "claude-3-5-sonnet-20240620",
      max_tokens: 512,
      messages: [{ role: "user", content: query }]
    })
  });

  if (!response.ok) {
    throw new Error("Claude request failed.");
  }
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

async function fetchFactChecks(query) {
  ensureConfig("factCheckApiKey", "Fact Check API key");
  const url = new URL("https://factchecktools.googleapis.com/v1alpha1/claims:search");
  url.searchParams.set("key", config.factCheckApiKey);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", "10");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Fact Check request failed.");
  }
  const data = await response.json();
  const claims = data.claims || [];
  return buildFactCheckSummary(claims);
}

function buildFactCheckSummary(claims) {
  if (!claims.length) {
    return {
      truthScore: "--",
      coverageScore: "0%",
      claimSummaryHtml: "<span class=\"status\">No claims found.</span>"
    };
  }

  const ratings = [];
  const claimSummaries = claims.slice(0, 3).map((claim) => {
    const review = claim.claimReview?.[0];
    const rating = review?.textualRating || "Unrated";
    const publisher = review?.publisher?.name || "Unknown source";
    ratings.push(rating);
    return `<div>• ${claim.text} — <strong>${rating}</strong> (${publisher})</div>`;
  });

  const truthScore = computeTruthScore(ratings);
  const coverageScore = `${Math.round(
    (Math.min(claims.length, MAX_CLAIM_COUNT) / MAX_CLAIM_COUNT) * 100
  )}%`;

  return {
    truthScore: `${truthScore}%`,
    coverageScore,
    claimSummaryHtml: claimSummaries.join("") || "<span class=\"status\">No claims found.</span>"
  };
}

function computeTruthScore(ratings) {
  if (!ratings.length) {
    return 0;
  }
  const scores = ratings.map(mapRatingToScore);
  const total = scores.reduce((sum, score) => sum + score, 0);
  return Math.round(total / scores.length);
}

function mapRatingToScore(rating) {
  const normalized = rating.toLowerCase();
  for (const entry of ratingMap) {
    if (entry.match.some((keyword) => normalized.includes(keyword))) {
      return entry.score;
    }
  }
  return 50;
}

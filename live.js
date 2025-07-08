const apiUrl = "https://playwithme.pw/player_api.php";
const proxyUrl = "https://wickedtv-proxy.onrender.com";
const user = JSON.parse(localStorage.getItem("xtream_user"));

if (!user) {
  window.location.href = "index.html";
}

const username = user.user_info.username;
const password = user.user_info.password;

let allChannels = [];

async function fetchCategories() {
  const res = await fetch(`${apiUrl}?username=${username}&password=${password}&action=get_live_categories`);
  const categories = await res.json();
  renderCategories(categories);
}

function renderCategories(categories) {
  const list = document.getElementById("categoryList");
  list.innerHTML = "";
  categories.forEach(cat => {
    const item = document.createElement("div");
    item.textContent = cat.category_name;
    item.dataset.id = cat.category_id;
    item.className = "category-item";
    item.onclick = () => filterChannels(cat.category_id);
    list.appendChild(item);
  });
}

async function fetchChannels() {
  const res = await fetch(`${apiUrl}?username=${username}&password=${password}&action=get_live_streams`);
  const data = await res.json();
  allChannels = data;
  renderChannels(data);
}

function filterChannels(categoryId) {
  const filtered = allChannels.filter(ch => ch.category_id === categoryId);
  renderChannels(filtered);
}

function renderChannels(channels) {
  const list = document.getElementById("channelList");
  list.innerHTML = "";
  channels.forEach((ch) => {
    const item = document.createElement("div");
    item.className = "channel-item";
    item.innerHTML = `
      <img src="${ch.stream_icon}" onerror="this.src='assets/default.png'">
      <span>${ch.name}</span>
    `;
    item.onclick = () => playStream(ch.stream_id, ch.name);
    list.appendChild(item);
  });
}

function playStream(id, name) {
  const video = document.getElementById("videoPlayer");
  const url = `https://wickedtv-proxy.onrender.com/live/${username}/${password}/${id}.ts`;

  video.src = url;
  video.load();

  const onError = () => {
    alert("Stream failed to load.");
    video.removeEventListener("error", onError);
  };

  video.addEventListener("error", onError);

  video.play().catch(() => {
    // fallback logic if browser still won't play it
    alert("Stream playback failed.");
  });

  document.getElementById("epgInfo").innerHTML = `<h3>${name}</h3>`;
  fetchEPG(id);
}

async function fetchEPG(id) {
  const res = await fetch(`${apiUrl}?username=${username}&password=${password}&action=get_short_epg&stream_id=${id}`);
  const data = await res.json();
  const epg = document.getElementById("epgInfo");
  data.epg_listings?.forEach((e, i) => {
    const title = decodeURIComponent(escape(atob(e.title)));
    const div = document.createElement("div");
    div.innerHTML = `<div class="${i === 0 ? 'now' : ''}">${e.start} - ${e.end} <strong>${title}</strong></div>`;
    epg.appendChild(div);
  });
}

fetchCategories();
fetchChannels();

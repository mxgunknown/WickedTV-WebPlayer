const apiUrl = "https://playwithme.pw/player_api.php";
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

  const allItem = document.createElement("div");
  allItem.textContent = "All";
  allItem.className = "category-item";
  allItem.onclick = () => renderChannels(allChannels);
  list.appendChild(allItem);

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
  const workerProxy = "https://wickedtv.maxgarbett1.workers.dev";

  const m3u8 = `http://playwithme.pw:8080/live/${username}/${password}/${id}.m3u8`;
  const ts = `http://playwithme.pw:8080/live/${username}/${password}/${id}.ts`;

  video.src = `${workerProxy}/?url=${encodeURIComponent(m3u8)}`;
  video.play().catch(() => {
    video.src = `${workerProxy}/?url=${encodeURIComponent(ts)}`;
    video.play().catch(() => {
      alert("Stream failed to load.");
    });
  });

  document.getElementById("epgInfo").innerHTML = `<h3>${name}</h3>`;
  fetchEPG(id);
}

function decodeTitle(title) {
  try {
    if (/^[A-Za-z0-9+/=]{8,}$/.test(title)) {
      return atob(title);
    }
  } catch {}
  return title;
}

async function fetchEPG(id) {
  const res = await fetch(`${apiUrl}?username=${username}&password=${password}&action=get_short_epg&stream_id=${id}`);
  const data = await res.json();
  const epg = document.getElementById("epgInfo");

  data.epg_listings?.forEach((e, i) => {
    const title = decodeTitle(e.title);
    const div = document.createElement("div");
    div.innerHTML = `<div class="${i === 0 ? 'now' : ''}">${e.start} - ${e.end} <strong>${title}</strong></div>`;
    epg.appendChild(div);
  });
}

fetchCategories();
fetchChannels();

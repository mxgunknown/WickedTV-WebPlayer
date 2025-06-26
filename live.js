const apiUrl = "http://playwithme.pw/player_api.php";
const user = JSON.parse(localStorage.getItem("xtream_user"));

if (!user) {
  window.location.href = "index.html";
}

const username = user.user_info.username;
const password = user.user_info.password;

async function fetchChannels() {
  const res = await fetch(`${apiUrl}?username=${username}&password=${password}&action=get_live_streams`);
  const data = await res.json();
  renderChannels(data);
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
    item.onclick = () => playStream(ch.stream_id);
    list.appendChild(item);
  });
}

function playStream(id) {
  const video = document.getElementById("videoPlayer");
  video.src = `http://playwithme.pw:8080/live/${username}/${password}/${id}.m3u8`;
  video.play();
  fetchEPG(id);
}

async function fetchEPG(id) {
  const res = await fetch(`${apiUrl}?username=${username}&password=${password}&action=get_short_epg&stream_id=${id}`);
  const data = await res.json();
  const epg = document.getElementById("epgInfo");
  epg.innerHTML = "";
  data.epg_listings?.forEach((e, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<div class="${i === 0 ? 'now' : ''}">${e.start} - ${e.end} <strong>${e.title}</strong></div>`;
    epg.appendChild(div);
  });
}

fetchChannels();

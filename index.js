

async function init() {
  await loadIdentity();
  loadPosts();
}
async function loadPosts() {
  document.getElementById("posts_box").innerText = "Loading...";
  let postsJson = await fetchJSON(`api/${apiVersion}/posts`);

  let postsHtml = postsJson
    .map((postInfo) => {


      
      return `

      <div class="post">
      <a href="/eventDetail.html?event=${encodeURIComponent(
        postInfo.id)}&user=${encodeURIComponent(
          postInfo.username
        )}"> <img src="/api/${apiVersion}/posts/image/${postInfo.id}" alt="Post Image" class="post-image" /> </a>

        <div class="post-title">
          <i class="fas fa-file-alt"></i> ${escapeHTML(postInfo.title)}
        </div>
        <div class="post-location">
          <i class="fas fa-map-marker-alt"></i>
          <span class="post-city">${escapeHTML(postInfo.city)}</span>,
          <span class="post-postal">${escapeHTML(postInfo.postal)}</span>
        </div>
        <div class="post-description">
          <i class="fas fa-align-left"></i> ${escapeHTML(postInfo.description)}
        </div>

        <div class="post-userinfo">
          <i class="fas fa-user"></i>
          <a href="/userInfo.html?user=${encodeURIComponent(postInfo.username)}">
            ${escapeHTML(postInfo.username)}
          </a>,
          <i class="far fa-clock"></i>
          <span>${escapeHTML(new Date(postInfo.created_date).toLocaleString())}</span>
        </div>
        
        <div class="post-interactions">
        <span title="${postInfo.likes ? escapeHTML(postInfo.likes.join(", ")) : ""}"> ${postInfo.likes ? `${postInfo.likes.length}` : 0} likes </span> &nbsp; &nbsp; 
        <span class="heart-button-span ${myIdentity ? "" : "d-none"}">
            ${postInfo.likes && postInfo.likes.includes(myIdentity) ?
          `<button class="heart_button" onclick='unlikePost("${postInfo.id}")'>&#x2665;</button>` :
          `<button class="heart_button" onclick='likePost("${postInfo.id}")'>&#x2661;</button>`} 
        </span>
        </div>
      </div>`;
    })
    .join("\n");

  document.getElementById("posts_box").innerHTML = postsHtml;
}

async function postUrl() {
  document.getElementById("postStatus").innerHTML = "sending data...";
  let url = document.getElementById("urlInput").value;
  let description = document.getElementById("descriptionInput").value;

  try {
    await fetchJSON(`api/${apiVersion}/posts`, {
      method: "POST",
      body: { url: url, description: description },
    });
  } catch (error) {
    document.getElementById("postStatus").innerText = "Error";
    throw error;
  }
  document.getElementById("urlInput").value = "";
  document.getElementById("descriptionInput").value = "";
  document.getElementById("url_previews").innerHTML = "";
  document.getElementById("postStatus").innerHTML = "successfully uploaded";
  loadPosts();
}

let lastTypedUrl = "";
let lastTypedTime = Date.now();
let lastURLPreviewed = "";
async function previewUrl() {
  document.getElementById("postStatus").innerHTML = "";
  let url = document.getElementById("urlInput").value;

  // make sure we are looking at a new url (they might have clicked or something, but not changed the text)
  if (url != lastTypedUrl) {
    //In order to not overwhelm the server,
    // if we recently made a request (in the last 0.5s), pause in case the user is still typing
    lastTypedUrl = url;
    let timeSinceLastType = Date.now() - lastTypedTime;
    lastTypedTime = Date.now();
    if (timeSinceLastType < 500) {
      await new Promise((r) => setTimeout(r, 1000)); // wait 1 second
    }
    // if after pausing the last typed url is still our current url, then continue
    // otherwise, they were typing during our 1 second pause and we should stop trying
    // to preview this outdated url
    if (url != lastTypedUrl) {
      return;
    }

    if (url != lastURLPreviewed) {
      // make sure this isn't the one we just previewd
      lastURLPreviewed = url; // mark this url as one we are previewing
      document.getElementById("url_previews").innerHTML = "Loading preview...";
      try {
        let response = await fetch(`api/${apiVersion}/urls/preview?url=` + url);
        let previewHtml = await response.text();
        if (url == lastURLPreviewed) {
          document.getElementById("url_previews").innerHTML = previewHtml;
        }
      } catch (error) {
        document.getElementById("url_previews").innerHTML =
          "There was an error: " + error;
      }
    }
  }
}

async function likePost(postID){
    await fetchJSON(`api/${apiVersion}/posts/like`, {
        method: "POST",
        body: {postID: postID}
    })
    loadPosts();
}


async function unlikePost(postID){
    await fetchJSON(`api/${apiVersion}/posts/unlike`, {
        method: "POST",
        body: {postID: postID}
    })
    loadPosts();
}


async function postEvent() {
  document.getElementById("postStatus").innerHTML = "Sending data...";

  // Collecting event details from input fields
  let title = document.getElementById("titleInput").value;
  let city = document.getElementById("locationInput").value;
  let postal = document.getElementById("postalInput").value;
  let description = document.getElementById("descriptionInput").value;
  let image = document.getElementById("imageUpload").files[0];

  // Prepare form data for the image
  let formData = new FormData();
  formData.append("title", title);
  formData.append("city", city);
  formData.append("postal", postal);
  formData.append("description", description);
  formData.append("image", image);

  try {
    // Assuming your API can handle FormData for image upload
    let response = await fetch(`api/${apiVersion}/posts`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    document.getElementById("postStatus").innerHTML = "Successfully uploaded";

    // Clear the form fields
    document.getElementById("titleInput").value = "";
    document.getElementById("locationInput").value = "";
    document.getElementById("postalInput").value = "";
    document.getElementById("descriptionInput").value = "";
    document.getElementById("imageUpload").value = "";

    // Reload posts to display the new one
    loadPosts();
  } catch (error) {
    document.getElementById("postStatus").innerText = "Error: " + error.message;
    console.error("Error posting the event:", error);
  }
}

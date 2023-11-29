async function init() {
  await loadIdentity();
  loadUserInfo();
  const urlParams = new URLSearchParams(window.location.search);
  const postID = urlParams.get("event");

  if (postID) {
    loadPostDetail(postID); 
    loadPostComments(postID); 
  }
}


async function loadPostDetail(postID) {
  
  try {
    let posts = await fetchJSON(`api/${apiVersion}/posts`);
    let postDetail = posts.find(post => post.id === postID);

   

    document.getElementById("eventdetail").innerHTML = `
      <h3>${escapeHTML(postDetail.title)}</h3>
      <p>${escapeHTML(postDetail.description)}</p>
    `;
  } catch (error) {
    console.error("Error loading post detail:", error);
    document.getElementById("eventdetail").innerHTML = "<p>Error loading post detail.</p>";
  }
}




async function loadPostComments(postID) {
  document.getElementById("comments").innerHTML = 

  `<button onclick='toggleComments("${postID}")'>View/Hide comments</button>
                <div id='comments-box-${postID}' class="comments-box d-none">
                    <button onclick='refreshComments("${postID}")')>refresh comments</button>
                    <div id='comments-${postID}'></div>
                    <div class="new-comment-box ${myIdentity? "": "d-none"}">
                        New Comment:
                        <textarea type="textbox" id="new-comment-${postID}"></textarea>
                        <button onclick='postComment("${postID}")'>Post Comment</button>
                    </div>
                </div>`
}







function getCommentHTML(commentsJSON){
  return commentsJSON.map(commentInfo => {
      return `
      <div class="individual-comment-box">
          <div>${escapeHTML(commentInfo.comment)}</div>
          <div> - <a href="/userInfo.html?user=${encodeURIComponent(commentInfo.username)}">${escapeHTML(commentInfo.username)}</a>, ${escapeHTML(commentInfo.created_date)}</div>
      </div>`
  }).join(" ");
}

async function toggleComments(postID){
  let element = document.getElementById(`comments-box-${postID}`);
  if(!element.classList.contains("d-none")){
      element.classList.add("d-none");
  }else{
      element.classList.remove("d-none");
      let commentsElement = document.getElementById(`comments-${postID}`);
      if(commentsElement.innerHTML == ""){ // load comments if not yet loaded
          commentsElement.innerHTML = "loading..."

          let commentsJSON = await fetchJSON(`api/${apiVersion}/comments?postID=${postID}`)
          commentsElement.innerHTML = getCommentHTML(commentsJSON);          
      }
  }
  
}

async function refreshComments(postID){
  let commentsElement = document.getElementById(`comments-${postID}`);
  commentsElement.innerHTML = "loading..."

  let commentsJSON = await fetchJSON(`api/${apiVersion}/comments?postID=${postID}`)
  commentsElement.innerHTML = getCommentHTML(commentsJSON);
}

async function postComment(postID){
  let newComment = document.getElementById(`new-comment-${postID}`).value;

  let responseJson = await fetchJSON(`api/${apiVersion}/comments`, {
      method: "POST",
      body: {postID: postID, newComment: newComment}
  })
  
  refreshComments(postID);
  document.getElementById(`new-comment-${postID}`).value = ""
}


async function loadUserInfo(){
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('user');
    if(username==myIdentity){
        document.getElementById("username-span").innerText= `You (${username})`;
    }else{
        document.getElementById("username-span").innerText=username;
        document.getElementById("user_info_new_div").classList.add("d-none");
    }
    
  }
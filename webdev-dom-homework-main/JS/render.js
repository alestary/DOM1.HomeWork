import { escapeHtml } from './replaceAll.js';
import { comments } from './comments.js';

export {renderComments};

function renderComments() {
  const commentsList = document.getElementById("comments-list");
  
  const commentsHtml = comments.map((comment) => {
    const likeButtonClass = comment.isLiked ? "like-button -active-like" : "like-button";
    
    return `
      <li class="comment" data-id="${comment.id}">
        <div class="comment-header">
          <div>${escapeHtml(comment.name)}</div>
          <div>${comment.date}</div>
        </div>
        <div class="comment-body">
          <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
        <div class="comment-footer">
          <div class="likes">
            <span class="likes-counter">${comment.likes}</span>
            <button class="${likeButtonClass}" data-id="${comment.id}"></button>
          </div>
        </div>
      </li>
    `;
  }).join("");

  commentsList.innerHTML = commentsHtml;
}
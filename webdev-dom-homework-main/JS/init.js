import { comments } from './comments.js';
import { renderComments } from './render.js';

export {initEventHandlers};

function initEventHandlers() {
        const commentsList = document.getElementById("comments-list");
        
        commentsList.addEventListener("click", (event) => {
          if (event.target.classList.contains("like-button")) {
            return;
          }
          
          const commentElement = event.target.closest(".comment");
          if (!commentElement) return;
          
          const commentId = Number(commentElement.dataset.id);
          const comment = comments.find(c => c.id === commentId);
          
          if (comment) {
            
            const replyText = `> ${comment.name}:\n${comment.text}\n\n`;
            
            const commentInput = document.getElementById("comment-input");
            commentInput.value = replyText;
            
            commentInput.focus();
            
            commentInput.scrollIntoView({ behavior: "smooth" });
          }
        });
        
        commentsList.addEventListener("click", (event) => {
          if (event.target.classList.contains("like-button")) {
            const commentId = Number(event.target.dataset.id);
            const commentIndex = comments.findIndex(comment => comment.id === commentId);
            
            if (commentIndex !== -1) {
              if (comments[commentIndex].isLiked) {
                comments[commentIndex].likes -= 1;
              } else {
                comments[commentIndex].likes += 1;
              }
              comments[commentIndex].isLiked = !comments[commentIndex].isLiked;
              
              renderComments();
            }
          }
        });
      }
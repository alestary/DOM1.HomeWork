"use strict";
import { comments } from './comments.js';
import { escapeHtml } from './replaceAll.js';
import { renderComments } from './render.js';
import { initEventHandlers } from './init.js';

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString().slice(-2);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}


function addComment(name, text) {
  const escapedName = escapeHtml(name.trim());
  const escapedText = escapeHtml(text.trim());
  
  if (!escapedName || !escapedText) {
    alert("Пожалуйста, заполните оба поля");
    return;
  }

  const newComment = {
    id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
    name: escapedName,
    date: formatDate(new Date()),
    text: escapedText,
    likes: 0,
    isLiked: false,
  };
  comments.push(newComment);
  
  renderComments();
}

document.addEventListener("DOMContentLoaded", () => {
  renderComments();
  initEventHandlers();

  const nameInput = document.getElementById("name-input");
  const commentInput = document.getElementById("comment-input");
  const addButton = document.getElementById("add-button");
  
  addButton.addEventListener("click", () => {
    addComment(nameInput.value, commentInput.value);
    
    nameInput.value = "";
    commentInput.value = "";
    
    nameInput.focus();
  });
  
    commentInput.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      addComment(nameInput.value, commentInput.value);
      nameInput.value = "";
      commentInput.value = "";
      nameInput.focus();
    }
  });
  
  console.log("Приложение загружено! Лайки работают.");
});
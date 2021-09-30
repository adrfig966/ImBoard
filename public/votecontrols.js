/* This script will handle adding likes or dislikes to posts  */

function sendvote(e, type, id, remove) {
  e.preventDefault();

  var operation = remove ? "/removevote/" : "/addvote/";

  $.post(operation + type, { id: id }, (data, status, xhr) => {
    if (xhr.status != 200) return;
    if (!data) return;
    location.reload();
  });
}

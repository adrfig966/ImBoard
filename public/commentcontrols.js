/* This script will handle the displaying and hiding of comment forms using the labeled buttons  */
/* Additionally, it will also handle the validation and submission of comments  */
//If there is a comment with a focus class, scroll to it

if($(".focuscomment").length > 0){$(".focuscomment").next().get(0).scrollIntoView(false)}

function commentsubmit(e) {
  e.preventDefault();
  //Grab the text area reference from the data property attached to event object
  var commentlength = $(e.data.textref).val().length;
  if (commentlength < 10 || commentlength > 150) {
    return; //Exit if length is invalid
  }

  //Remove comment form on submit
  $(e.target).remove();

  $.post(
    "/addcomment",
    //Serialize form data and attach target post's ID
    $(e.target).serialize() + "&id=" + e.data.id,
    (data, status) => {
      if(status == 429){
        $('.comment-feedback').text('You have submitted too many comments please wait.');
        return;
      }
      var path = window.location.pathname;
      var newcomment = data.comments[data.comments.length-1];
      window.location.assign(
        "/" + e.data.section + "/posts/" + e.data.id + "/?comid=" + newcomment._id
      );
    }
  ).fail((err) => {
    if(err.status == 429){
      alert("Please slow your rate of comments");
      return;
    }
  });
}
function formclose(e) {
  e.preventDefault();
  $(".comment-input").remove();
}
//Comment text validation feedback
function commentinput(e) {
  var lengthdisplay = e.data.lengthref;
  $(lengthdisplay).text(e.target.value.length + "/150");
  if (e.target.value.length >= 10 && e.target.value.length <= 150) {
    $(lengthdisplay).removeClass("text-danger");
    $(lengthdisplay).addClass("text-info");
  } else {
    $(lengthdisplay).addClass("text-danger");
    $(lengthdisplay).removeClass("text-info");
  }
}
//User name validation feedback
function userinput(e) {
  if ($(e.target).is(":invalid")) {
    $(e.data.feedbackref)
      .text("Your name contains invalid chracters")
      .addClass("text-danger");
  } else {
    $(e.data.feedbackref)
      .text("Valid name")
      .removeClass("text-danger");
  }
}

//Event handler for comment form button
//ID and section name are passed from template
function addcomment(e, postid, section, user) {
  console.log('user is', user);
  //Wipe other open forms
  $(".comment-input").remove();
  //Bootstrap container to hold dynamic content
  var formrow = $("<div></div>").addClass("row");
  //Validation UI elements
  var commentlength = $("<small></small>")
    .addClass("text-danger")
    .text("0/150");
  var namefeedback = $("<small></small>").text(
    "Hash will default to your IP if not signed in."
  );

  /*Note the use of references passed in to event handlers.
    This helps minimize the use of repetitive JQuery in handler functions*/

  //Comment text area
  var textinput = $("<textarea name='content' required></textarea>")
    .addClass("form-control mb-2")
    .attr("cols", "100%")
    .attr("placeholder", "Enter response")
    .keyup({ lengthref: commentlength }, commentinput);
  //User name text input
  var nameinput = $("<input type='text' name='user'></input>")
    .addClass("form-control mt-2")
    .attr("pattern", "[A-Za-z0-9_]{0,25}")
    .attr("placeholder", "Enter secret hash (optional)")
    .attr("maxlength", "25")
    .keyup({ feedbackref: namefeedback }, userinput);
  if(user){
    nameinput.val(user);
    nameinput.prop('disabled', true);
  }
  //Buttons
  var submitbtn = $("<input type='submit'></input>")
    .val("Submit")
    .addClass("btn btn-light btn-block");
  var closebtn = $("<input type='submit'></input>")
    .val("Close")
    .addClass("btn btn-light btn-block")
    .click(formclose);
  //Structure new elements
  formrow.append(
    $('<div></div')
      .addClass("col-8")
      .append(textinput)
      .append(commentlength)
      .append(nameinput)
      .append(namefeedback)
  );
  formrow.append(
    $('<div></div')
      .addClass("col-4")
      .append(submitbtn)
      .append(closebtn)
  );
  //Append new elements
  $(`div#${postid} .content-half`).append(
    $("<form></form>")
      .addClass("comment-input")
      .append(formrow)
      .submit({ id: postid, section: section, textref: textinput }, commentsubmit)
  );
}

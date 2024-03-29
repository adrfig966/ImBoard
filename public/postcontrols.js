/* This script will handle the validation and submission of posts*/

function gotopost(e, postid, section) {
  var path = window.location.pathname;
  window.location.assign("/" + section + "/posts/" + postid);
}
function postsubmit(e, section) {
  e.preventDefault();

  var postlength = $("#postcontent").val().length;
  var file = $("#pictureupload").get(0).files[0];

  var postdata = new FormData(e.target);

  if (postlength < 10 || postlength > 250) {
    return;
  }
  if(file){
    if(file.size > 3145728 || !checkFileExt(file.name)){
      return;
    }
    //If image will be attached add field to request body inidicating a file should be expect
    postdata.append("expectfile", "true")
  }

  //Re-order elements so multer populates request body object properly on back-end
  postdata.delete("postpicture");
  postdata.append("section", section);
  postdata.append("postpicture", file);
  $.ajax({
    type: "post",
    url: "/newpost",
    data: postdata,
    //We dont want JQuery to process data or set Content-Type header when sending binary data
    processData: false,
    contentType: false
  }).then(
  (data, status) => {
    console.log(data);
    gotopost(null, data._id, section)
  }).fail((err) => {
    if(err.status == 429){
      alert("Please slow your rate of posts");
      return;
    }
  });
}

//Utility function to check file extension validity
function checkFileExt(filename){
  var splitname = filename.split(".");
  var ext = splitname[splitname.length-1].toLowerCase();
  var allowtypes = ["jpg", "png", "gif", "bmp"]
  if(allowtypes.includes(ext)){
    return true;
  }
  return false;

}
//Resets upload
$('.clear-button').click(e => {
  //Reset all feedback elements
  $('.image-preview').css('background-image', 'none');
  $('.preview-container').css('display', 'none');
  $(".fsize-bar").width('0');
  $(".progress-bar-text").text('File size');
  //Clear upload
  $("#pictureupload").val(null);
});
//Image file validation feedback
$("#pictureupload").change(e => {
  if(!e.target.files[0]){return;}
  var file = e.target.files[0];
  $('.preview-container').css('display', 'block');
  $('.image-preview').css('background-image', `url(${URL.createObjectURL(file)})`);
  var percentused = file.size / 3145728 * 100;
  percentused = Math.min(100, percentused).toFixed(2);
  var sizebar = $(".fsize-bar")
  var barlabel = $(".progress-bar-text");
  sizebar.width(percentused + "%");
  barlabel.text(`${percentused}%`);
  if(percentused >= 100) barlabel.text(`Size limit exceeded.`);
  if(!checkFileExt(file.name) || percentused >= 100){
    sizebar.removeClass("bg-success");
    sizebar.addClass("bg-danger");
  }else{
    sizebar.addClass("bg-success");
    sizebar.removeClass("bg-danger");
  }
});
//User name validation feedback
$("#postuser").keyup(e => {
  var postuserlength = e.target.value.length;
  var lengthdisplay = $("#postulength");
  lengthdisplay.text(postuserlength + "/25");
  if ($(e.target).is(":invalid")) {
    lengthdisplay.removeClass("text-success");
    lengthdisplay.addClass("text-danger");
  } else {
    lengthdisplay.addClass("text-success");
    lengthdisplay.removeClass("text-danger");
  }
});
// Post content validation feedback
$("#postcontent").keyup(e => {
  var postlength = e.target.value.length;
  var lengthdisplay = $("#postlength");
  lengthdisplay.text(postlength + "/250");
  if (postlength >= 10 && postlength <= 250) {
    lengthdisplay.removeClass("text-danger");
    lengthdisplay.addClass("text-success");
  } else {
    lengthdisplay.addClass("text-danger");
    lengthdisplay.removeClass("text-success");
  }
});

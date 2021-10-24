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
    if(file.size > 1048576 || !checkFileExt(file.name)){
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
    },
    errdata => {
      console.log(errdata);
    }
  );
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
//Image file validation feedback
$("#pictureupload").change(e => {
  if(!e.target.files[0]){return;}
  var file = e.target.files[0];
  var percentused = file.size / 1048576 * 100;
  var sizebar = $(".fsize-bar");
  sizebar.width(percentused + "%");
  if(!checkFileExt(file.name)){
    sizebar.removeClass("bg-success");
    sizebar.addClass("bg-danger");
  }else{
    sizebar.addClass("bg-success");
    sizebar.removeClass("bg-danger");
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

/*Will run when page is done rendering*/
/*This script will handle the formatting of time, and post hyperlinks*/
/*Time is grabbed from Mongo Object ID.*/
/*Hyperlinks are detected from the use of a notation in a comment.*/

//Converts MongoDB object IDs into a formatted date
$(".id2dt").each( function (index){
    var hexstring = $(this).text().substr(0, 8);
    var seconds = parseInt(hexstring, 16);
    var date = moment(new Date(seconds*1000));
    $(this).text((date.format("ddd MMM Do, YYYY @ h:mmA zz")));
})

// Wraps shorthand (ex. >>0123456789abcdef12345678) for comment links in comments' contents with <a> tags
{
    //Regex eyesore to extract from current location the minimal path needed to create comment link
    let path = window.location.pathname;
    path = path.match(/.+\/posts\/[a-fA-F0-9]{24}/)
    path = path?path[0]:null

    //Run for each match
    $(".comment-content").each( function(index){

        var commentHtml = $(this).html();

        //matchAll allows us to use capture groups for multiple matches
        var matchedTags = [...commentHtml.matchAll(/&gt;&gt;([0-9a-fA-F]{24})/g)];
        
        for(tag of matchedTags){
            console.log("Current tag:", tag[0]);
            commentHtml = commentHtml.replace(tag[0], `<a href='${path}?comid=${tag[1]}'>${tag[1]}</a>`);
        }
        $(this).html(commentHtml);
    });
}

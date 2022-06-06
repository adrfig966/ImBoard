# ImBoard

An image board system built using NodeJS as a server, along with the Express framework for request handling and routing. MongoDB is used as a database and [Nunjucks](https://mozilla.github.io/nunjucks/) is used a templating engine to render views via NodeJS.

View live web app here - [ImBoard](http://imboard.io/home).

## Features

- Dynamic sections - by entering a path in the format *sectionname*/posts you can visit a page that will display posts for that specific "section."
- Post and comment throttling
- Image or text posts - Create posts with images or just text
- Reply to comments - By using a simple syntax in their comments users can reply to existing comments in a post's comments. The syntax is as follows *>>XXXXXXXXXXXXX* - this will generate a link in the new comment which will highlight and scroll to the comment referenced.
- Optional sign in with Google
- Like or dislike posts (if signed in)
- Post anonymously while retaining an identity by entering a string which is then hashed. The hashed string will act as a person's "username" since only they know the string to generate that specific hash.
- Post deleting mechanic - this message board was designed around the limitation of database space and because of this posts are deleted once a post limit is reached for a specific section. The posts are deleted according to a ranking algorithm where the lowest ranked post is deleted first.
- Ranking algorithm - A ranking algorithm is implemented by utilizing the MongoDB aggregation pipeline. The algorithm takes into consideration likes, views, and comments. The algorithm features a time decay which will lower a posts score over time based on its age. It also takes into consideration the last time someone commented and penalizes the posts accordingly. I modeled this after the algorithms used by Facebook and other social media platforms.

## Todo

- A basic admin area to allow the moderation of posts.
- More UI improvements

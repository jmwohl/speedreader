var read = require('node-readability');

read('http://howtonode.org/really-simple-file-uploads', function(err, article, meta) {
  // The title of the page.
  console.log(article.title);
  // The main body of the page.
  console.log(article.content);

  // The raw HTML code of the page
  // console.log(article.html);
  // The document object of the page
  // console.log(article.document);

  // The response object from request lib
  // console.log(meta);
});
export const extractProtectedArticle = (article) => {
  delete article.content;
  delete article.html;
};

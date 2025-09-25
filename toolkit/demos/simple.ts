// src/services/articleService.ts
import toolkit from '@fecommunity/reactpress-toolkit';

// api
import { api, utils, types, config, http } from '@fecommunity/reactpress-toolkit'

api.article.findAll();
utils.deepClone({});
const a = {} as types.IArticle;
const article: Partial<types.IArticle> = {};
const locales = config.locales


http.createApiInstance({
  
});



// // GOOD
// api.article.findAll();
// api.category.findById('test');

// // GOOD
// utils.deepClone({});
// utils.formatDate(new Date());

// // GOOD
// const articles: types.IArticle[] = [];
// const category: types.ICategory = {};


// // GOOD
// config.defaultLocale
// config.locales
// config.globalSetting


// // GOOD
// import api from '@fecommunity/reactpress-toolkit/api'
// import types from '@fecommunity/reactpress-toolkit/types'
// import utils from '@fecommunity/reactpress-toolkit/utils'
// import config from '@fecommunity/reactpress-toolkit/config'

// import { IArticle } from '@fecommunity/reactpress-toolkit/types'
// import { article, category } from '@fecommunity/reactpress-toolkit/api'
// import { formatDate } from '@fecommunity/reactpress-toolkit/utils'

// article.findAll();
// category.findAll();

// // BAD
// import { locales } from '@fecommunity/reactpress-toolkit'
// import { globalSetting } from '@fecommunity/reactpress-toolkit'

// import globalSetting from '@fecommunity/reactpress-toolkit/globalSetting'
// import locales from '@fecommunity/reactpress-toolkit/locales'
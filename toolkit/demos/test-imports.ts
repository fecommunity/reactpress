// Test file to verify toolkit exports

// Test 1: Default import
import toolkit from '@fecommunity/reactpress-toolkit';
console.log('Default import test:', toolkit);

// Test 2: Named imports
import { api, types, utils, config } from '@fecommunity/reactpress-toolkit';
console.log('Named imports test:', { api, types, utils, config });

// Test 3: Individual module imports
import * as apiModule from '@fecommunity/reactpress-toolkit/api';
import * as typesModule from '@fecommunity/reactpress-toolkit/types';
import * as utilsModule from '@fecommunity/reactpress-toolkit/utils';
import * as configModule from '@fecommunity/reactpress-toolkit/config';

console.log('Individual module imports test:', {
  apiModule,
  typesModule,
  utilsModule,
  configModule
});

console.log('All import tests completed successfully!');
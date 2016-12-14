// @flow
import { Schema, arrayOf } from 'normalizr';

import moduleEntity from '../modules/';
import directoryEntity from '../directories/';
import userEntity from '../users/';

import createEntity from '../create-entity';
import createActions from './actions';

const schema = new Schema('sandboxes');
schema.define({
  modules: arrayOf(moduleEntity.schema),
  directories: arrayOf(directoryEntity.schema),
  author: userEntity.schema,
});

export type Sandbox = {
  id: string;
  title: string;
  slug: string;
  description: string;
  modules: Array<string>;
  directories: Array<string>;
  mainModule: string;
  author: ?string;
};

const actions = createActions(schema);

export default createEntity(schema, { actions });

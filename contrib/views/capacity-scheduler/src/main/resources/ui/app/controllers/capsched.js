/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var App = require('app');

App.CapschedController = Ember.Controller.extend({
  actions: {
    loadTagged: function (tag) {
      this.transitionToRoute('capsched.scheduler').then(function() {
         this.store.fetchTagged(App.Queue, tag);
       }.bind(this));
    },
    clearAlert: function () {
      this.set('alertMessage',null);
    },
  },

  /**
   * User admin status.
   * @type {Boolean}
   */
  isOperator: false,

  /**
   * Inverted isOperator value.
   * @type {Boolean}
   */
  isNotOperator: Ember.computed.not('isOperator'),

  alertMessage: null,

  tags: function () {
    return this.store.find('tag');
  }.property('store.current_tag'),

  sortedTags: Ember.computed.sort('tags', function(a, b){
    return (+a.id > +b.id)? (+a.id < +b.id)? 0 : -1 : 1;
  })

});

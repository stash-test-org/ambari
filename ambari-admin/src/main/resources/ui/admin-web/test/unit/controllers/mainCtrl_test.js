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

describe('#Auth', function () {

  describe('signout', function () {
    var scope, ctrl, $httpBackend, $window, clusterService,deferred;
    beforeEach(module('ambariAdminConsole', function($provide){
      $provide.value('$window', {location: {pathname: 'http://c6401.ambari.apache.org:8080/views/ADMIN_VIEW/2.0.0/INSTANCE/#/'}});
      localStorage.ambari = JSON.stringify({app: {authenticated: true, loginName: 'admin', user: 'user'}});
    }));
    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });
    beforeEach(inject(function (_$httpBackend_, $rootScope, $controller, _$window_, _Cluster_,_$q_) {
      clusterService =  _Cluster_;
      deferred = _$q_.defer();
      spyOn(clusterService, 'getStatus').andReturn(deferred.promise);
      deferred.resolve({
        Clusters: {
          provisioning_state: 'INIT'
        }
      });
      $window = _$window_;
      $httpBackend = _$httpBackend_;
      var re = /api\/v1\/services\/AMBARI\/components\/AMBARI_SERVER.+/;
      $httpBackend.whenGET(re).respond(200, {
          RootServiceComponents: {
            component_version: 2.2,
            properties: {
              'user.inactivity.timeout.default': 20
            }
          }
      });
      $httpBackend.whenGET(/\/api\/v1\/logout\?_=\d+/).respond(200,{message: "successfully logged out"});
      $httpBackend.whenGET(/\/api\/v1\/views.+/)
        .respond(200,{
          "href": "http://c6401.ambari.apache.org:8080/api/v1/views?fields=versions/instances/ViewInstanceInfo&versions/ViewVersionInfo/system=false&versions/instances/ViewInstanceInfo/visible=true",
          "items": [
            {
              "ViewInfo": {
                "view_name": "SLIDER"
              },
              "href": "http://c6401.ambari.apache.org:8080/api/v1/views/SLIDER",
              "versions": [
                {
                  "ViewVersionInfo": {
                    "system": false,
                    "version": "1.0.0",
                    "view_name": "SLIDER"
                  },
                  "href": "http://c6401.ambari.apache.org:8080/api/v1/views/SLIDER/versions/1.0.0",
                  "instances": [
                    {
                      "ViewInstanceInfo": {
                        "context_path": "/views/SLIDER/1.0.0/VisibleInstance",
                        "description": "VisibleInstance",
                        "icon64_path": null,
                        "icon_path": null,
                        "instance_data": {},
                        "instance_name": "VisibleInstance",
                        "label": "VisibleInstance",
                        "properties": {
                          "ambari.server.password": "123",
                          "ambari.server.url": "123",
                          "ambari.server.username": "123",
                          "slider.user": null,
                          "view.kerberos.principal": null,
                          "view.kerberos.principal.keytab": null
                        },
                        "static": false,
                        "version": "1.0.0",
                        "view_name": "SLIDER",
                        "visible": true
                      },
                      "href": "http://c6401.ambari.apache.org:8080/api/v1/views/SLIDER/versions/1.0.0/instances/VisibleInstance"
                    }
                  ]
                }
              ]
            }
          ]
        });
      $httpBackend.whenGET(/\/persist\/user-pref-.*/).respond(200, {data: {data: {addingNewRepository: true}}});
      $httpBackend.whenGET(/\/api\/v1\/users\/admin\/authorizations.*/).respond(200, {data: {data: {items: [{AuthorizationInfo : {authorization_id : "AMBARI.RENAME_CLUSTER"}}]}}});
      scope = $rootScope.$new();
      scope.$apply();
      ctrl = $controller('MainCtrl', {$scope: scope});
    }));

    it('should reset window.location and ambari localstorage', function () {
      scope.signOut();

      runs(function() {
        chai.expect($window.location.pathname).to.be.empty;
      });

      var data = JSON.parse(localStorage.ambari);
      chai.expect(data.app.authenticated).to.equal(undefined);
      chai.expect(data.app.loginName).to.equal(undefined);
      chai.expect(data.app.user).to.equal(undefined);
      $httpBackend.flush();
    });

    it('should get visible view instances and show them in top nav menu', function() {
      $httpBackend.flush();

      chai.expect(scope.viewInstances.length).to.equal(1);
      chai.expect(scope.viewInstances[0].instance_name).to.equal('VisibleInstance');
    });
  });
});

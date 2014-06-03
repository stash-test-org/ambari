/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

var App = require('app');

var stringUtils = require('utils/string_utils');

App.hostsMapper = App.QuickDataMapper.create({

  model: App.Host,
  config: {
    id: 'Hosts.host_name',
    host_name: 'Hosts.host_name',
    public_host_name: 'Hosts.public_host_name',
    cluster_id: 'cluster_id',// Hosts.cluster_name
    rack: 'Hosts.rack_info',
    host_components_key: 'host_components',
    host_components_type: 'array',
    host_components: {
      item: 'id'
    },
    critical_alerts_count: 'critical_alerts_count',
    cpu: 'Hosts.cpu_count',
    cpu_physical: 'Hosts.ph_cpu_count',
    memory: 'Hosts.total_mem',
    disk_info: 'Hosts.disk_info',
    disk_total: 'metrics.disk.disk_total',
    disk_free: 'metrics.disk.disk_free',
    health_status: 'Hosts.host_status',
    load_one: 'metrics.load.load_one',
    load_five: 'metrics.load.load_five',
    load_fifteen: 'metrics.load.load_fifteen',
    cpu_system: 'metrics.cpu.cpu_system',
    cpu_user: 'metrics.cpu.cpu_user',
    mem_total: 'metrics.memory.mem_total',
    mem_free: 'metrics.memory.mem_free',
    last_heart_beat_time: "Hosts.last_heartbeat_time",
    os_arch: 'Hosts.os_arch',
    os_type: 'Hosts.os_type',
    ip: 'Hosts.ip',
    passive_state: 'Hosts.maintenance_state'
  },
  map: function (json, isAll) {
    console.time('App.hostsMapper execution time');
    if (json.items) {
      var hostsWithFullInfo = [];
      var hostIds = {};

      json.items.forEach(function (item) {
        item.host_components = item.host_components || [];
        item.host_components.forEach(function (host_component) {
          host_component.id = host_component.HostRoles.component_name + "_" + item.Hosts.host_name;
        }, this);
        item.critical_alerts_count = (item.alerts) ? item.alerts.summary.CRITICAL + item.alerts.summary.WARNING : 0;
        item.cluster_id = App.get('clusterName');



        var parsedItem = this.parseIt(item, this.config);
        parsedItem.is_requested = !isAll;

        hostIds[item.Hosts.host_name] = parsedItem;

        hostsWithFullInfo.push(parsedItem);
      }, this);

      hostsWithFullInfo = hostsWithFullInfo.sortProperty('public_host_name');

      App.Host.find().forEach(function (host) {
        if (isAll && host.get('isRequested')) {
          hostIds[host.get('hostName')].is_requested = true;
        } else if (!hostIds[host.get('hostName')]) {
          host.set('isRequested', false);
        }
      });
      App.store.loadMany(App.Host, hostsWithFullInfo);
    }
    console.timeEnd('App.hostsMapper execution time');
  }
});

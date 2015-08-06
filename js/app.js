/**
 * WorldMapSkiller
 *
 * written by Valéry Febvre
 * vfebvre@aester-eggs.com
 *
 * Copyright 2015 Valéry Febvre
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var App = {
    name: 'WorldMapSkiller',
    countries: null,
    worldMap: null,
    store: null,

    $currentPage: $('#world-map'),

    // Initialize and start app
    start: function() {
        // about
        $('#about-open').on('click', function () {
            $('#about').attr('class', 'leftToCurrent');
            $('#world-map').attr('class', 'currentToRight');
        });
        $('#about-close').on('click', function () {
            $('#world-map').attr('class', 'rightToCurrent');
            $('#about').attr('class', 'currentToLeft');
        });

        // init localStorage
        App.store = Rhaboo.persistent(App.name);
        if (!App.store.stats) {
            App.store.write('stats', {});
        }

        // load countries GeoJSON data and start app
        $.getJSON('data/ne_110m_admin_0_map_units.geo.json', function(data) {
            App.countries = data.features;
            App.worldMap = new WorldMap();
            App.stats = new Stats();
        });
    },

    getCountryInfo: function(properties) {
        var flag;

        if ($.inArray(properties.name, ['England', 'Kosovo', 'Wales']) >= 0) {
             flag = '_' + properties.name;
        }
        else if (properties.iso_a2 != -99) {
            flag = properties.iso_a2.toLowerCase();
        }
        else if (properties.postal != -99) {
            flag = properties.postal.toLowerCase();
        }

        return {
            code: properties.adm0_a3,
            name: properties.name_long,
            continent: properties.continent + (properties.continent !== properties.subregion ? ' / ' + properties.subregion : ''),
            population: (properties.pop_est / 1000000).toFixed(1),        
            flag: flag
        };

    }
};

window.addEventListener('load', App.start, false);

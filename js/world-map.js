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

function WorldMap() {
    var $page = $('#world-map');
    var $mapBoxTop = $('#map-box-top .content').hide();
    var $mapBoxBottom = $('#map-box-bottom .content').hide();
    var $mapOverlay = $('#map-overlay').hide();

    var started = false;

    var drawPile;
    var question;

    var map;
    var mainLayer;
    var countriesLayers = [];
    var highlightedCountryLayer;
    var colors = [ // http://www.flatuicolorpicker.com/
        '#E74C3C', // ALIZARIN : india, australia
        '#E26A6A', // SUNGLO : URSS
        '#2ECC71', // EMERALD : argentina, mongolia
        '#95A5A6', // CONCRETE : USA, chine, groenland, antartica
        '#F1C40F', // SUN FLOWER : brazil, algeria
        '#E67E22', // CARROT : canada, mexico
        '#4183D7'  // ROYAL BLUE: france
    ];

    var animations = [
        'bounceInDown',
        'lightSpeedIn',
        'tada',
        'rubberBand',
        'flip',
        'rotateIn',
        'zoomInDown'
    ];

    function init() {
        // toolbar buttons
        $('#btn-start', $page).on('click', function(e) {
            startOrStop();
        });
        $('#btn-next', $page).on('click', function(e) {
            drawQuestion();
        });
        $('#btn-reset-map-view', $page).on('click', function(e) {
            resetMapView();
        });

        // init map
        $('#map', $page)
            .width(window.innerWidth)
            .height(window.innerHeight);

        map = L.map(
            'map',
            {zoomControl: false, attributionControl: false, worldCopyJump: true, minZoom: 1, maxZoom: 7});
        map.doubleClickZoom.disable();
        resetMapView();

        mainLayer = L.geoJson(
            App.countries,
            {
                style: function(feature) {
                    return {
                        color: 'white',
                        fillColor: colors[feature.properties.mapcolor7 - 1],
                        fillOpacity: 1,
                        opacity: 1,
                        weight: 1
                    };
                },
                onEachFeature: function(feature, layer) {
                    countriesLayers[feature.properties.adm0_a3] = layer;
                    layer.on({
                        click: selectCountry
                    });
                }
            }
        ).addTo(map);
    }

    function checkAnswer(layer) {
        var min;
        var distance;
        var correct;
        var stats;

        if (question.code === layer.feature.properties.adm0_a3) {
            distance = 0;
            correct = true;
            if (!App.store.stats[question.code]) {
                App.store.stats.write(question.code, [question.trials]);
            }
            else {
                App.store.stats[question.code].push(question.trials);
            }
        }
        else {
            // compute minimal distance between 2 polygons
            $.each(getCountryBiggestPolygon(countriesLayers[question.code])._latlngs, function(i, latlng1) {
                $.each(getCountryBiggestPolygon(layer)._latlngs, function(j, latlng2) {
                    if (!min || latlng1.distanceTo(latlng2) < min) {
                        min = latlng1.distanceTo(latlng2);
                    }
                });
            });
            distance = (min / 1000).toFixed(0);
            correct = false;
        }

        return {
            correct: correct,
            distance: distance
        };
    }

    function drawQuestion() {
        var rnd;
        var index;
        var country;
        var html;

        resetMapView();

        if (drawPile.length === 0) {
            startOrStop();

            html = 'You reached end of ' + App.countries.length + ' countries. Congratulations!';
            $mapBoxTop.html(html).show();

            return;
        }

        rnd = Math.floor(Math.random() * drawPile.length);
        index = drawPile.splice(rnd, 1);
        country = App.countries[index];

        question = App.getCountryInfo(country.properties);
        question.trials = 0;

        html = '<span class="f32"><span class="flag ' + question.flag + '"></span></span>';
        html += '<p>Where is <strong>' + question.name + '</strong>?<br>';
        html += question.continent + ' (' + question.population + ' M people)</p>';

        $mapBoxTop.html(html).show();
        $mapBoxBottom.hide();
    }

    function getCountryBiggestPolygon(layer) {
        var biggest;

        if (layer instanceof L.MultiPolygon) {
            // find biggest polygon
            $.each(layer._layers, function(i, sublayer) {
                if (!biggest || sublayer._latlngs.length > biggest._latlngs.length) {
                    biggest = sublayer;
                }
            });
        }
        else {
            biggest = layer;
        }

        return biggest;
    }

    function resetMapView() {
        map.setView([48.48, 2.2], 1);
    }

    function selectCountry(e) {
        var result;
        var message;

        if (highlightedCountryLayer && highlightedCountryLayer.feature.properties.name === e.target.feature.properties.name) {
            return;
        }

        unselectCountry();
        highlightedCountryLayer = e.target;
        //highlightedCountryLayer.bringToFront();
        highlightedCountryLayer.setStyle({
            fillColor: '#22313F'
            //weight: 3,
            //color: '#666'
        });

        if (!started) {
            var info = App.getCountryInfo(highlightedCountryLayer.feature.properties);
            var html = '<span class="f32"><span class="flag ' + info.flag + '"></span></span>';
            html += '<p><strong>' + info.name + '</strong><br>';
            html += info.continent + ' (' + info.population + ' M people)</p>';

            $mapBoxTop.html(html).show();
            return;
        }
        
        if (map.tap) {
            map.tap.disable();
        }

        question.trials += 1;
        result = checkAnswer(highlightedCountryLayer);
        if (result.correct) {
            $mapBoxBottom.hide();

            message = 'Well done!!!';
            $mapOverlay.html(message)
                .removeClass()
                .show()
                .addClass(animations[Math.floor(Math.random() * animations.length)] + ' animated')
                .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    window.setTimeout(function() {
                        $mapOverlay.removeClass().hide();

                        drawQuestion();

                        if (map.tap) {
                            map.tap.enable();
                        }
                    }, 1000);
                });
        }
        else {
            if (result.distance <= 100) {
                message = 'Missed. But you are very close.';
            }
            else {
                message = 'Missed. Far from ~' + result.distance + ' km.';
            }
            message += ' It is <strong>' + highlightedCountryLayer.feature.properties.name_long + '</strong>.';
            $mapBoxBottom.html(message).show();

            if (map.tap) {
                map.tap.enable();
            }
        }
    }

    function startOrStop() {
        if (!started) {
            started = true;

            $('#btn-start').removeClass('icon-play-arrow').addClass('icon-stop');
            $('#btn-next').css('visibility', 'visible');

            drawPile = Array.apply(null, {length: App.countries.length}).map(Number.call, Number);

            drawQuestion();
        }
        else {
            started = false;

            $('#btn-start').removeClass('icon-stop').addClass('icon-play-arrow');
            $('#btn-next').css('visibility', 'hidden');

            drawPile = null;

            $mapBoxTop.hide();
            $mapBoxBottom.hide();
        }
    }

    function unselectCountry() {
        if (highlightedCountryLayer) {
            mainLayer.resetStyle(highlightedCountryLayer);
            //highlightedCountryLayer.bringToBack();
        }
    }

    init();

    return {
    };
}

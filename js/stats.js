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

function Stats() {
    var $page = $('#stats');

    function init() {
        $('#stats-open').on('click', function () {
            refresh();
            open();
        });
        $('#stats-back').on('click', function () {
            close();
        });

        $.each(App.countries, function(i, country) {
            var $li;
            var info = App.getCountryInfo(country.properties);

            $li = $([
                '<li>',
                '<aside class="pack-start">',
                '<span class="f32"><span class="flag ' + info.flag + '"></span></span>',
                '</aside>',
                '<aside class="pack-end" id="score-' + info.code + '">',
                '</aside>',
                '<p>' + info.name + '</p>',
                '<p>' + info.continent + '</p>',
                '</li>'
            ].join(''));
            $('#stats-list', $page).append($li);
        });
    }

    function close() {
        $('#stats').attr('class', 'currentToRight');
        $('#world-map').attr('class', 'leftToCurrent');        
    }

    function open() {
        $('#world-map').attr('class', 'currentToLeft');
        $('#stats').attr('class', 'rightToCurrent');
    }
    
    function refresh() {
        var overallScoreAvg = 0, overallScoreMin = 0, overallScoreLast = 0;
        var statsSize = _.size(App.store.stats);

        if (statsSize) {
            $.each(App.store.stats, function(code, scores) {
                var html;
                var scoreAvg, scoreMin, scoreMax, scoreLast;

                if (scores) {
                    scoreAvg = scores.reduce(function(sum, v) { return sum + v; }, 0) / scores.length;
                    scoreMin = _.min(scores);
                    scoreMax = _.max(scores);
                    scoreLast = _.last(scores);
                    overallScoreAvg += scoreAvg;
                    overallScoreMin += scoreMin;
                    overallScoreLast += scoreLast;

                    html  = '<p>Best: ' + (scoreMin ? scoreMin : '-') + '</p>';
                    html += '<p>Last: ' + (scoreLast ? scoreLast : '-') + '</p>';
                    html += '<p>Worst: ' + (scoreMax ? scoreMax : '-') + '</p>';
                    html += '<p>Avg.: ' + (scoreAvg ? scoreAvg.toFixed(1) : '-') + '</p>';
                    $('#score-' + code, $page).html(html);
                }
            });
            overallScoreAvg = (overallScoreAvg / _.size(App.store.stats)).toFixed(1);
            overallScoreMin = (overallScoreMin / _.size(App.store.stats)).toFixed(1);
            overallScoreLast = (overallScoreLast / _.size(App.store.stats)).toFixed(1);
        }

        $('#overall-score-avg', $page).html(overallScoreAvg ? overallScoreAvg : '-');
        $('#overall-score-min', $page).html(overallScoreMin ? overallScoreMin : '-');
        $('#overall-score-last', $page).html(overallScoreLast ? overallScoreLast : '-');
    }

    init();

    return {
    };
}

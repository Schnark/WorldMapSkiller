#! /usr/bin/env python

import json
import requests
import sys

data = json.load(open('data/ne_110m_admin_0_countries.geo.json'))

def translate(s, lang, of_en, of):
    url = u'http://mymemory.translated.net/api/get?q={0}&langpair=en|{1}'.format(s, lang)

    # remove space, dot and quote characters
    slug = s.replace(' ', '').replace('.', '').replace("'", "")

    line = u'{0} = {1}\n'.format(slug, s)
    of_en.write(line.encode('utf-8'))

    r = requests.get(url)
    line = u'{0} = {1}\n'.format(slug, r.json()['responseData']['translatedText'])
    of.write(line.encode('utf-8'))


def build(lang):
    of_en = open('locales/worldmapskiller.countries.en-US.properties', 'w+')
    of = open('locales/worldmapskiller.countries.{0}.properties'.format(lang), 'w+')

    continents = set()
    subregions = set()

    of.write('# Countries\n'.encode('utf-8'))
    of_en.write('# Countries\n'.encode('utf-8'))
    for country in data['features']:
        continents.update([country['properties']['continent']])
        subregions.update([country['properties']['subregion']])

        translate(country['properties']['name_long'], lang, of_en, of)

    of.write('\n# Continents\n'.encode('utf-8'))
    of_en.write('\n# Continents\n'.encode('utf-8'))
    for continent in sorted(list(continents)):
        translate(continent, lang, of_en, of)

    of.write('\n# Subregions\n'.encode('utf-8'))
    of_en.write('\n# Subregions\n'.encode('utf-8'))
    for subregion in sorted(list(subregions)):
        translate(subregion, lang, of_en, of)

    of_en.close()
    of.close()


def main(argv = None):
    lang = argv[1]
    build(lang)


if __name__ == "__main__":
    sys.exit(main(sys.argv))

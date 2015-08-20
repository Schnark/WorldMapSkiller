#! /bin/sh

if [ ! -d "data" ]; then
    mkdir data
fi
cd data

FILE=ne_110m_admin_0_countries
#FILE=ne_110m_admin_0_map_units
URL=http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/110m/cultural/$FILE.zip

wget $URL

mkdir tmp
unzip $FILE.zip -d tmp

# conversion SHAPE => GeoJSON
rm -f *.geo.json
ogr2ogr -f GeoJSON $FILE.geo.json tmp/$FILE.shp

rm -Rf tmp $FILE.zip

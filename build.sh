#! /bin/sh

APP_NAME=WorldMapSkiller

if [ ! -d "build" ]; then
    mkdir build
fi
cd build

VERSION=$(grep version ../manifest.webapp | cut -d: -f2 | cut -d\" -f2)
ARCHIVE_NAME=$APP_NAME-$VERSION.zip

rm -f $ARCHIVE_NAME
rm -Rf $VERSION
mkdir $VERSION
cd $VERSION

cp -r ../../* .
rm -Rf build* untracked
7z a ../$ARCHIVE_NAME *
echo "New package build/$ARCHIVE_NAME was successfully created"

cd ..
rm -Rf $VERSION

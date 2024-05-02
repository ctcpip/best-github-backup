#!/bin/sh

success=true
node ./index.mjs
exitCode=$?
success=true

if [ $exitCode -ne 3 ] ;
then
  success=false
  echo "command should fail if no args provided"
fi

node ./index.mjs -o "$ORG" -t "$TOKEN"
exitCode=$?

if [ $exitCode -eq 0 ] ;
then
  node ./index.mjs -o "$ORG" -t "$TOKEN"
  exitCode=$?

  if [ $exitCode -ne 0 ] ;
  then
    success=false
    echo "second run failed"
  fi

else
  success=false
  echo "first run failed"
fi

if [ "$success" != true ] ; then
  exit 42
fi

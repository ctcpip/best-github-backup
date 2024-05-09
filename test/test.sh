#!/bin/sh

# expected environment variables:
# ORG, ORG_WITH_REPO, TOKEN

ctr=0

test() {
  ctr=$((ctr+1))
  printf "\nrunning test %s" $ctr
  node ./src/index.mjs "$1" "$2" "$3" "$4" "$5"
  exitCode=$?
}

check() {
  if [ $exitCode -ne "$1" ] ;
  then
    success=false
    echo "$2"
  fi
}

success=true

test
check 3 "command should fail if no args provided"

test -o "$ORG" -t "$TOKEN"
check 0 "test $ctr failed"

test -o "$ORG" -t "$TOKEN"
check 0 "test $ctr failed"

if [ "$ORG" != "$ORG_WITH_REPO" ] ;
then
  rm -rf ./data
fi

test -o "$ORG_WITH_REPO" -t "$TOKEN" -g
check 0 "test $ctr failed"

test -o "$ORG_WITH_REPO" -t "$TOKEN" -g
check 0 "test $ctr failed"

test -o "$ORG_WITH_REPO" -t "$TOKEN" -ga
check 0 "test $ctr failed"

test -o "$ORG_WITH_REPO" -t "$TOKEN" -ga
check 0 "test $ctr failed"

if [ "$success" != true ] ; then
  exit 42
fi

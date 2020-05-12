#!/bin/bash

language=$1

if [ -z "$language" ]; then
    echo "kanguage required. Eg. python"
    exit 1
fi

if [ -x "$(command -v dotrun)" ]; then
    dotrun "lint-$1"
else
    ./run exec "lint-$1"
fi

if [ $? -eq 0 ]; then
    exit 0
else
    exit 1
fi

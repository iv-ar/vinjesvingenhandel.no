#!/bin/bash
cloc --exclude-dir=node_modules,vendor,bin,obj --exclude-lang=SVG,JSON,XML ./src

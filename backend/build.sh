#!/bin/sh
cur_dir=$(pwd)
echo $cur_dir

javac -encoding UTF-8 -d "classes" -classpath ".\\lib\\json-20160810.jar:.\\lib\\opencsv-3.3.jar:." .\\src\\mining\\*.java

java -classpath ".\\lib\\json-20160810.jar:.\\lib\\opencsv-3.3.jar:.\\classes" mining.Main

read -p "Finished! Press any key to continue..." var


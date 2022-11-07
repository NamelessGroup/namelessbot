# Un-comment this as soon as we're merging to master again
cp -rf ./namelessbot/config .
rm -rf ./config/templates
rm -rf ./namelessbot

git clone https://github.com/NamelessGroup/namelessbot.git

cp -rf ./config ./namelessbot/

cd namelessbot
yarn install
yarn start

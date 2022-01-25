cp -r ./namelessbot/config/ ./config/
rm -rf ./config/templates/*
rm -rf ./namelessbot/*

git clone https://github.com/NamelessGroup/namelessbot.git

cp -rf ./config/ ./namelessbot/config/

apt-get install ffmpeg -Y
pip install -r ./namelessbot/requirements.txt
python ./namelessbot/main.py
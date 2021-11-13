cp ./namelessbot/config.json ./config.json

rm -rf ./namelessbot/*
git clone https://github.com/NamelessGroup/namelessbot.git

cp ./config.json ./namelessbot/config.json

apt-get install ffmpeg -Y
pip install -r ./namelessbot/requirements.txt
python ./namelessbot/main.py
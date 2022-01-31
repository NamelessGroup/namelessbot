cp -rf ./namelessbot/config .
rm -rf ./config/templates
rm -rf ./namelessbot

git clone https://github.com/NamelessGroup/namelessbot.git

cp -rf ./config ./namelessbot/

apt-get install -y ffmpeg
cd namelessbot
pip install -r requirements.txt
python main.py
cp ./namelessbot/config.json ./config.json

git clone https://github.com/NamelessGroup/namelessbot.git

cp ./config.json ./namelessbot/config.json

pip install -r ./namelessbot/requirements.txt
python ./namelessbot/main.py

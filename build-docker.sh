docker rm -f diddys_party
build -t web_cursed_party .
docker run --name=diddys_party --rm -p 3000:3000 -p 8080:8080 -it diddys_party

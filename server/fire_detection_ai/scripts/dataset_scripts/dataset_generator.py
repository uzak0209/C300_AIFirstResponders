from simple_image_download import simple_image_download as sid

response = sid.simple_image_download

# keywords = ["burning_house", "buring_home", "house_fire", "home_fire"]
# keywords = ["singapore_burning_house", "singapore_fire", "singapore_hdb_on_fire"]
keywords = ["bin fire", "bin on fire", "trashbin fire", "fire in trashbin"]

for kw in keywords:
    response().download(kw, 30)
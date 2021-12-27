import os

mylist = os.listdir()
for name in mylist:
    if "category_" in name:
        os.rename(name, name.replace("category_", "category_no"))

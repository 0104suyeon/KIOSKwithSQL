import os

mylist = os.listdir()
for name in mylist:
    if "set_" in name:
        os.rename(name, name.replace("set_", "set_no"))

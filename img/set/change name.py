import os

mylist = os.listdir()
for name in mylist:
    if "set_no" in name:
        num = int(name.replace("set_no", "").replace(".png", "").replace("d", ""))
        if num > 15:
            os.rename(name, name.replace("d.png", ".png"))
            # num += 1
            

        


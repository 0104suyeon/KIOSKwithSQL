import os

mylist = os.listdir()
for name in mylist:
    if "set_no" in name:
        num = int(name.replace("set_no", "").replace(".png", ""))
        # if num > 15:
        num += 50
        os.rename(name, f"set_no{num}.png")
            # num += 1
            

        


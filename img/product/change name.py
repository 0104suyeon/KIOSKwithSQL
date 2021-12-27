import os

mylist = os.listdir()
for name in mylist:
    if "product_no" in name:
        num = int(name.replace("product_no", "").replace(".png", ""))
        if num > 21:
            num -= 1
            os.rename(name, f"product_no{num}.png")

        


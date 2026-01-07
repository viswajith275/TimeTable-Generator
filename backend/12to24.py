time=(input("enter time as hr.min AM/PM:"))

def convert(time):
    t = time.split() # ["hr.min" , "AM/PM"]
    if t[1] == "PM":
        return (int(t[0].split(".")[0]) + 12, int(t[0].split(".")[1]))
    return (int(t[0].split(".")[0]), int(t[0].split(".")[1]))

print(convert(time))